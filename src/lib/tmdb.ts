/**
 * SHOWARA SERVER-SIDE TMDB CLIENT
 * 
 * Provides secure access to TMDB API without exposing tokens to the client.
 * Features in-memory caching, rate-limit tolerance, and graceful fallback
 * to the authentic real-movie seed dataset.
 */

import { Movie, CastMember, CrewMember, MovieStatus, MovieTrailer } from "@/types/movie";
import { PersonDetails } from "@/types/person";
import seedMoviesRaw from "@/data/seedMovies.json";
import { imageService } from "@/services/imageService";
import { slugify, matchesSlug } from "@/lib/slug";

import https from "https";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Auto-detect and resolve API Key vs Read Access Token
// In TMDB, the Read Access Token is a JWT starting with "eyJ", and the API Key is a 32-char hex string
function getResolvedCredentials() {
  let apiKey = process.env.TMDB_API_KEY?.trim();
  let token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();

  if (apiKey?.startsWith("eyJ") && token && !token.startsWith("eyJ")) {
    const swap = apiKey;
    apiKey = token;
    token = swap;
  } else if (apiKey?.startsWith("eyJ") && !token) {
    token = apiKey;
    apiKey = undefined;
  }

  return { apiKey, token };
}

const { apiKey: TMDB_API_KEY, token: TMDB_READ_ACCESS_TOKEN } = getResolvedCredentials();
const IS_DEMO_MODE = process.env.DEMO_MODE === "true" || (!TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN);

// In-memory cache for TMDB requests with 1-hour TTL
const memoryCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Normalized seed movies preserving both camelCase and snake_case properties
const SEED_MOVIES: Movie[] = (seedMoviesRaw as any[]).map((raw) => {
  const posterPath = raw.poster_path || raw.posterPath || "";
  const backdropPath = raw.backdrop_path || raw.backdropPath || "";
  return {
    ...raw,
    posterPath,
    poster_path: posterPath,
    backdropPath,
    backdrop_path: backdropPath,
    posterUrl: raw.posterUrl || (posterPath ? imageService.getPosterUrl(posterPath, "w500", raw.title) : ""),
    backdropUrl: raw.backdropUrl || (backdropPath ? imageService.getBackdropUrl(backdropPath, "original", raw.title) : ""),
  } as Movie;
});

/**
 * Node https fallback in case global fetch suffers ECONNRESET on Windows
 */
function httpsFallbackFetch<T>(urlStr: string, headers: Record<string, string>): Promise<T | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const req = https.get(
        {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          headers: {
            "User-Agent": "Showara/1.0",
            ...headers,
          },
        },
        (res) => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            console.warn(`TMDB API https error ${res.statusCode} for ${parsed.pathname}`);
            resolve(null);
            return;
          }
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            try {
              resolve(JSON.parse(body) as T);
            } catch {
              resolve(null);
            }
          });
        }
      );
      req.on("error", (err) => {
        console.warn(`TMDB https fallback failed for ${parsed.pathname}:`, err.message);
        resolve(null);
      });
      req.setTimeout(8000, () => {
        req.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Perform an authorized fetch to TMDB API
 */
async function tmdbFetch<T>(endpoint: string, queryParams: Record<string, string | number> = {}): Promise<T | null> {
  // If in demo mode without credentials, don't attempt network call
  if (!TMDB_READ_ACCESS_TOKEN && !TMDB_API_KEY) {
    return null;
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  if (TMDB_API_KEY && !TMDB_READ_ACCESS_TOKEN) {
    url.searchParams.set("api_key", TMDB_API_KEY);
  }

  const cacheKey = url.toString();
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "Showara/1.0",
  };
  if (TMDB_READ_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`TMDB API error ${res.status}: ${res.statusText} for ${endpoint}`);
      // Try fallback if 401 or network problem
      const fallback = await httpsFallbackFetch<T>(url.toString(), headers);
      if (fallback) {
        memoryCache.set(cacheKey, { timestamp: Date.now(), data: fallback });
        return fallback;
      }
      return null;
    }

    const data = await res.json();
    memoryCache.set(cacheKey, { timestamp: Date.now(), data });
    return data as T;
  } catch (err: any) {
    // Attempt https fallback for socket/TLS errors
    const fallback = await httpsFallbackFetch<T>(url.toString(), headers);
    if (fallback) {
      memoryCache.set(cacheKey, { timestamp: Date.now(), data: fallback });
      return fallback;
    }
    console.warn(`TMDB fetch failed for ${endpoint}:`, err?.message || err);
    return null;
  }
}

/**
 * Regex patterns identifying non-trailer promotional video assets
 * that must NEVER be used as the movie's "Watch Trailer".
 */
const REJECTED_VIDEO_PATTERNS = [
  /\bfan[ -]?(trailer|made|edit|concept)\b/i,
  /\bconcept[ -]?trailer\b/i,
  /\breview\b/i,
  /\breaction\b/i,
  /\bclip\b/i,
  /\bscene\b/i,
  /\bfeaturette\b/i,
  /\bmaking[ -]?of\b/i,
  /\bpreview\b/i,
  /\binterview\b/i,
  /\bbehind the scenes\b/i,
  /\bbts\b/i,
  /\brecap\b/i,
  /\bshorts?\b/i,
  /\bmusic video\b/i,
  /\bsong\b/i,
  /\bbloopers?\b/i,
  /\bpromo\b/i,
  /\bcommercial\b/i,
  /\btv[ -]?spot\b/i,
  /\badvertisement\b/i,
  /\bexplained\b/i,
  /\bbreakdown\b/i,
];

/**
 * Determine if a TMDB video entry is ineligible as a movie trailer.
 */
export function isRejectedVideo(v: any): boolean {
  if (!v) return true;
  const type = String(v.type || "").trim();
  const name = String(v.name || "").trim();

  // ONLY type "Trailer" and "Teaser" are permitted for Watch Trailer
  if (type !== "Trailer" && type !== "Teaser") {
    return true;
  }

  // Check if name or type matches any prohibited non-trailer patterns
  for (const pattern of REJECTED_VIDEO_PATTERNS) {
    if (pattern.test(name) || pattern.test(type)) {
      return true;
    }
  }

  return false;
}

/**
 * Verify whether a candidate video title belongs to the target movie.
 * Handles subtitles, punctuation, multilingual Indian and international titles,
 * while rejecting candidates that name an unrelated movie or franchise.
 */
export function verifyVideoBelongsToMovie(
  videoName: string,
  movie: { title?: string; originalTitle?: string }
): boolean {
  if (!videoName || !movie) return true;
  const vName = videoName.toLowerCase().trim();
  const title = String(movie.title || "").toLowerCase().trim();
  const origTitle = String(movie.originalTitle || "").toLowerCase().trim();

  // List of major distinct movie titles/franchises that should never appear on another movie's trailer
  const UNRELATED_FRANCHISES = [
    "dune", "avatar", "deadpool", "wolverine", "oppenheimer", "interstellar",
    "kalki", "stree", "rrr", "kantara", "kgf", "gladiator", "pushpa",
    "devara", "toxic", "spider-man", "batman", "superman", "avengers", "star wars"
  ];

  for (const franchise of UNRELATED_FRANCHISES) {
    if (vName.includes(franchise)) {
      // If candidate video explicitly names this franchise, the movie itself MUST include it
      const matchesTitle = title.includes(franchise) || origTitle.includes(franchise);
      if (!matchesTitle) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Select the best trailer for a specific movie based on TMDB video data:
 * 1. Official YouTube Trailer
 * 2. YouTube Trailer (non-official Trailer)
 * 3. Official YouTube Teaser
 * 4. YouTube Teaser (non-official Teaser)
 * 5. No trailer (return null - NEVER use Reviews, Clips, Fan Trailers, or other movies!)
 */
export function selectBestTrailer(
  videosList: any[] = [],
  movieId: number | string = "",
  movieTitle: string = "",
  originalTitle: string = ""
): MovieTrailer | null {
  if (!Array.isArray(videosList) || videosList.length === 0) return null;

  // Filter only valid YouTube videos that are genuine Trailers or Teasers
  const eligibleVideos = videosList.filter(
    (v: any) =>
      v &&
      v.site === "YouTube" &&
      v.key &&
      typeof v.key === "string" &&
      /^[a-zA-Z0-9_-]{6,25}$/.test(v.key.trim()) &&
      !isRejectedVideo(v) &&
      verifyVideoBelongsToMovie(v.name || "", { title: movieTitle, originalTitle })
  );
  if (eligibleVideos.length === 0) return null;

  // 1. Official YouTube Trailer
  const officialTrailer = eligibleVideos.find((v: any) => v.type === "Trailer" && v.official === true);
  if (officialTrailer) {
    return {
      key: officialTrailer.key.trim(),
      name: officialTrailer.name || "Official Trailer",
      site: "YouTube",
      type: "Trailer",
      official: true,
      movieId,
      source: "tmdb",
    };
  }

  // 2. YouTube Trailer (non-official Trailer)
  const anyTrailer = eligibleVideos.find((v: any) => v.type === "Trailer");
  if (anyTrailer) {
    return {
      key: anyTrailer.key.trim(),
      name: anyTrailer.name || "Trailer",
      site: "YouTube",
      type: "Trailer",
      official: Boolean(anyTrailer.official),
      movieId,
      source: "tmdb",
    };
  }

  // 3. Official YouTube Teaser
  const officialTeaser = eligibleVideos.find((v: any) => v.type === "Teaser" && v.official === true);
  if (officialTeaser) {
    return {
      key: officialTeaser.key.trim(),
      name: officialTeaser.name || "Official Teaser",
      site: "YouTube",
      type: "Teaser",
      official: true,
      movieId,
      source: "tmdb",
    };
  }

  // 4. YouTube Teaser (non-official Teaser)
  const anyTeaser = eligibleVideos.find((v: any) => v.type === "Teaser");
  if (anyTeaser) {
    return {
      key: anyTeaser.key.trim(),
      name: anyTeaser.name || "Teaser",
      site: "YouTube",
      type: "Teaser",
      official: Boolean(anyTeaser.official),
      movieId,
      source: "tmdb",
    };
  }

  // 5. No trailer
  return null;
}

/**
 * Convert raw TMDB movie object to Showara Movie type
 */
function mapTmdbMovie(raw: any, status: MovieStatus = "now_showing"): Movie {
  const id = raw.id ? (String(raw.id).startsWith("mov-") ? String(raw.id) : `mov-tmdb-${raw.id}`) : `mov-${Date.now()}`;
  const slug = raw.slug || (raw.title ? slugify(raw.title) : `movie-${raw.id}`);

  const posterPath = raw.poster_path || raw.posterPath || "";
  const backdropPath = raw.backdrop_path || raw.backdropPath || "";
  const rating = Number((raw.vote_average ?? raw.rating ?? 7.5).toFixed(1));

  // Extract cast if credits appended, deduplicating by person ID
  const seenCast = new Set<string>();
  const cast: CastMember[] = [];
  for (const c of (raw.credits?.cast || raw.cast || [])) {
    const pId = c.id
      ? (String(c.id).startsWith("person-") ? String(c.id) : `person-${c.id}`)
      : `person-${slugify(c.name || "cast")}`;
    if (!seenCast.has(pId)) {
      seenCast.add(pId);
      cast.push({
        id: pId,
        name: c.name || "Cast Member",
        character: c.character || "Actor",
        profilePath: c.profile_path || c.profilePath || "",
        avatarUrl: c.avatarUrl || imageService.getProfileUrl(c.profile_path || c.profilePath, "w185", c.name),
        order: c.order,
      });
      if (cast.length >= 8) break;
    }
  }

  // Extract director
  const directors = (raw.credits?.crew || raw.crew || []).filter((cr: any) => cr.job === "Director");
  const directorName = raw.director || directors[0]?.name || "Acclaimed Director";

  // Deduplicate crew by person ID and role
  const seenCrew = new Set<string>();
  const crew: CrewMember[] = [];
  for (const cr of (raw.credits?.crew || raw.crew || [])) {
    const pId = cr.id
      ? (String(cr.id).startsWith("person-") ? String(cr.id) : `person-${cr.id}`)
      : `person-${slugify(cr.name || "crew")}`;
    const role = cr.job || cr.role || cr.department || "Crew";
    const crewKey = `${pId}-${slugify(role)}`;
    if (!seenCrew.has(crewKey)) {
      seenCrew.add(crewKey);
      crew.push({
        id: pId,
        name: cr.name || "Crew Member",
        job: cr.job || role,
        role: cr.role || role,
        department: cr.department,
        profilePath: cr.profile_path || cr.profilePath,
        avatarUrl: cr.avatarUrl || imageService.getProfileUrl(cr.profile_path || cr.profilePath, "w185", cr.name),
      });
      if (crew.length >= 6) break;
    }
  }

  // Find movie-specific trailer without any global fallback
  const movieId = raw.providerId || raw.id || id;
  const bestTrailer = selectBestTrailer(raw.videos?.results, movieId, raw.title);
  const isDuneMovie =
    id === "mov-dune-2" ||
    slug === "dune-part-two" ||
    raw.id === 693134 ||
    raw.providerId === 693134 ||
    String(raw.title || "").toLowerCase().includes("dune");

  const rawYoutubeId = raw.trailerYoutubeId ? String(raw.trailerYoutubeId).trim() : undefined;
  // If raw contains Dune's trailer key but the movie is NOT Dune, reject it immediately
  const safeSeedYoutubeId = rawYoutubeId === "Way9Dexny3w" && !isDuneMovie ? undefined : rawYoutubeId;

  const hasCheckedVideos = Array.isArray(raw.videos?.results);
  const fallbackKey = hasCheckedVideos ? undefined : (raw.trailerKey ? String(raw.trailerKey).trim() : undefined) || safeSeedYoutubeId;

  const canonicalTrailer: MovieTrailer | null = bestTrailer || (fallbackKey ? {
    key: fallbackKey,
    name: raw.trailerName || "Official Trailer",
    site: "YouTube",
    type: "Trailer",
    official: true,
    movieId: movieId,
    source: "verified_seed",
  } : null);

  const trailerKey = canonicalTrailer?.key;
  const trailerName = canonicalTrailer?.name;
  const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : undefined;

  // Genres: support both array of strings and TMDB object format
  const TMDB_GENRES_MAP: Record<number, string> = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };
  let genres: string[] = ["Action", "Cinema"];
  if (Array.isArray(raw.genres) && raw.genres.length > 0) {
    genres = raw.genres.map((g: any) => (typeof g === "string" ? g : g.name)).filter(Boolean);
  } else if (Array.isArray(raw.genre_ids) && raw.genre_ids.length > 0) {
    genres = raw.genre_ids.map((gid: number) => TMDB_GENRES_MAP[gid]).filter(Boolean);
  }

  const langMap: Record<string, string> = {
    hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", en: "English", es: "Spanish", fr: "French", ja: "Japanese", ko: "Korean"
  };
  const languages = Array.isArray(raw.languages) && raw.languages.length > 0
    ? raw.languages
    : [langMap[raw.original_language] || (raw.original_language ? raw.original_language.toUpperCase() : "English")];

  return {
    id,
    providerId: raw.id || raw.providerId,
    slug,
    title: raw.title,
    originalTitle: raw.original_title || raw.originalTitle,
    synopsis: raw.overview || raw.synopsis || "An exceptional cinematic storytelling experience.",
    overview: raw.overview || raw.synopsis,
    posterPath,
    poster_path: posterPath,
    backdropPath,
    backdrop_path: backdropPath,
    posterUrl: raw.posterUrl || imageService.getPosterUrl(posterPath, "w500", raw.title),
    backdropUrl: raw.backdropUrl || imageService.getBackdropUrl(backdropPath, "original", raw.title),
    trailer: canonicalTrailer,
    trailerYoutubeId: trailerKey || undefined,
    trailerKey,
    trailerName,
    trailerUrl,
    rating,
    ratingCount: raw.vote_count || raw.ratingCount || 12000,
    voteCount: raw.vote_count || raw.voteCount || 1200,
    tmdbRating: rating,
    showaraRating: Number((Math.min(5, (rating / 2) + 0.2)).toFixed(1)),
    durationMinutes: raw.runtime || raw.durationMinutes || 150,
    runtime: raw.runtime || raw.runtime || 150,
    releaseDate: raw.release_date || raw.releaseDate || "2024-01-01",
    certification: rating > 8 ? "UA 16+" : "UA 13+",
    languages,
    originalLanguage: raw.original_language || raw.originalLanguage,
    formats: raw.formats || ["IMAX 2D", "2D", "Dolby Cinema"],
    genres,
    status,
    cast,
    crew,
    director: directorName,
    isFeatured: rating >= 8.0,
    popularity: raw.popularity,
  };
}

export const tmdbClient = {
  /**
   * Check if live TMDB API keys are configured
   */
  hasApiKey: () => Boolean(TMDB_READ_ACCESS_TOKEN || TMDB_API_KEY),

  /**
   * Check if Demo Mode is active
   */
  isDemoMode: () => IS_DEMO_MODE,

  /**
   * Get all now-showing movies
   */
  getNowShowing: async (): Promise<Movie[]> => {
    const live = await tmdbFetch<{ results: any[] }>("/movie/now_playing", { region: "IN" });
    if (live && live.results?.length > 0) {
      return live.results.map((m) => mapTmdbMovie(m, "now_showing"));
    }
    return SEED_MOVIES.filter((m) => m.status === "now_showing");
  },

  /**
   * Get upcoming movies
   */
  getUpcoming: async (): Promise<Movie[]> => {
    const live = await tmdbFetch<{ results: any[] }>("/movie/upcoming", { region: "IN" });
    if (live && live.results?.length > 0) {
      return live.results.map((m) => mapTmdbMovie(m, "upcoming"));
    }
    return SEED_MOVIES.filter((m) => m.status === "upcoming");
  },

  /**
   * Get trending movies
   */
  getTrending: async (): Promise<Movie[]> => {
    const live = await tmdbFetch<{ results: any[] }>("/trending/movie/week");
    if (live && live.results?.length > 0) {
      return live.results.map((m) => mapTmdbMovie(m, "now_showing"));
    }
    return [...SEED_MOVIES].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
  },

  /**
   * Get popular movies
   */
  getPopular: async (): Promise<Movie[]> => {
    const live = await tmdbFetch<{ results: any[] }>("/movie/popular");
    if (live && live.results?.length > 0) {
      return live.results.map((m) => mapTmdbMovie(m, "now_showing"));
    }
    return [...SEED_MOVIES].sort((a, b) => b.rating - a.rating);
  },

  /**
   * Get all movies (combines live now_showing, upcoming, trending, popular with deduplication and seed fallback)
   */
  getAllMovies: async (): Promise<Movie[]> => {
    if (IS_DEMO_MODE || (!TMDB_READ_ACCESS_TOKEN && !TMDB_API_KEY)) {
      return SEED_MOVIES;
    }

    try {
      const [nowPlayingRes, upcomingRes, trendingRes, popularRes] = await Promise.allSettled([
        tmdbClient.getNowShowing(),
        tmdbClient.getUpcoming(),
        tmdbClient.getTrending(),
        tmdbClient.getPopular(),
      ]);

      const movieMap = new Map<string, Movie>();

      const addMovies = (movies: Movie[]) => {
        for (const movie of movies) {
          const key = movie.providerId ? `tmdb-${movie.providerId}` : movie.slug;
          if (!movieMap.has(key)) {
            movieMap.set(key, movie);
          }
        }
      };

      if (nowPlayingRes.status === "fulfilled" && nowPlayingRes.value.length > 0) {
        addMovies(nowPlayingRes.value);
      }
      if (upcomingRes.status === "fulfilled" && upcomingRes.value.length > 0) {
        addMovies(upcomingRes.value);
      }
      if (trendingRes.status === "fulfilled" && trendingRes.value.length > 0) {
        addMovies(trendingRes.value);
      }
      if (popularRes.status === "fulfilled" && popularRes.value.length > 0) {
        addMovies(popularRes.value);
      }

      if (movieMap.size > 0) {
        // Also retain curated Showara movies (Kalki, Stree 2, KGF 2, etc.) if not already in live results
        for (const seedMovie of SEED_MOVIES) {
          const key = seedMovie.providerId ? `tmdb-${seedMovie.providerId}` : seedMovie.slug;
          const exists = Array.from(movieMap.values()).some(
            (m) =>
              (seedMovie.providerId && m.providerId === seedMovie.providerId) ||
              m.slug === seedMovie.slug ||
              matchesSlug(m.title, seedMovie.title)
          );
          if (!exists) {
            movieMap.set(key, seedMovie);
          }
        }
        return Array.from(movieMap.values());
      }

      return SEED_MOVIES;
    } catch (err) {
      console.warn("getAllMovies failed, falling back to seed movies:", err);
      return SEED_MOVIES;
    }
  },

  /**
   * Find movie by slug or ID using a robust multi-stage lookup:
   * 1. Check current live movie catalog (same source of truth as listing)
   * 2. Check by TMDB numeric ID or mov-tmdb-{id}
   * 3. Search live TMDB by title derived from slug
   * 4. Check SEED_MOVIES fallback
   */
  getMovieBySlugOrId: async (slugOrId: string): Promise<Movie | null> => {
    if (!slugOrId) return null;
    const trimmed = slugOrId.trim();

    // 1. Search the active live movie catalog
    try {
      const allLive = await tmdbClient.getAllMovies();
      const inCatalog = allLive.find(
        (m) =>
          m.slug === trimmed ||
          m.id === trimmed ||
          String(m.providerId) === trimmed ||
          matchesSlug(m.slug, trimmed) ||
          matchesSlug(m.title, trimmed)
      );

      if (inCatalog) {
        // If it was loaded from a list endpoint without full credits/director/videos, enhance with full details
        if (inCatalog.providerId && (!inCatalog.trailerKey || !inCatalog.cast || inCatalog.cast.length === 0 || !inCatalog.director || inCatalog.director === "Acclaimed Director")) {
          const full = await tmdbFetch<any>(`/movie/${inCatalog.providerId}`, {
            append_to_response: "credits,videos,images,similar",
          });
          if (full) {
            const mapped = mapTmdbMovie(full, inCatalog.status);
            mapped.slug = inCatalog.slug;
            return mapped;
          }
        }
        return inCatalog;
      }
    } catch (e) {
      console.warn("Catalog lookup failed in getMovieBySlugOrId:", e);
    }

    // 2. If numerical TMDB ID or 'mov-tmdb-{id}'
    const numericMatch = trimmed.match(/^mov-tmdb-(\d+)$/) || trimmed.match(/^(\d+)$/);
    if (numericMatch) {
      const tmdbId = numericMatch[1];
      const live = await tmdbFetch<any>(`/movie/${tmdbId}`, {
        append_to_response: "credits,videos,images,similar",
      });
      if (live) return mapTmdbMovie(live);
    }

    // 3. Search live TMDB if configured (converts slug to search query)
    if (tmdbClient.hasApiKey() && !IS_DEMO_MODE) {
      const searchQuery = trimmed.replace(/-/g, " ").trim();
      if (searchQuery.length >= 2) {
        const searchRes = await tmdbFetch<{ results: any[] }>("/search/movie", { query: searchQuery });
        if (searchRes && searchRes.results?.length > 0) {
          const matched = searchRes.results.find((r) => matchesSlug(r.title, trimmed)) || searchRes.results[0];
          if (matched && matched.id) {
            const full = await tmdbFetch<any>(`/movie/${matched.id}`, {
              append_to_response: "credits,videos,images,similar",
            });
            if (full) return mapTmdbMovie(full);
          }
        }
      }
    }

    // 4. Fallback to SEED_MOVIES catalog
    const fromSeed = SEED_MOVIES.find(
      (m) =>
        m.slug === trimmed ||
        m.id === trimmed ||
        String(m.providerId) === trimmed ||
        matchesSlug(m.slug, trimmed) ||
        matchesSlug(m.title, trimmed)
    );
    if (fromSeed) return fromSeed;

    return null;
  },

  /**
   * Get movie videos directly from TMDB
   */
  getMovieVideos: async (movieId: number | string): Promise<any[]> => {
    const rawId = String(movieId).replace(/^mov-tmdb-/, "").trim();
    if (!rawId) return [];
    const res = await tmdbFetch<{ results: any[] }>(`/movie/${rawId}/videos`);
    return res?.results || [];
  },

  /**
   * Get best movie trailer directly from TMDB videos using strict priority
   */
  getMovieTrailer: async (movieId: number | string): Promise<MovieTrailer | null> => {
    const rawId = String(movieId).replace(/^mov-tmdb-/, "").trim();
    const videos = await tmdbClient.getMovieVideos(rawId);
    return selectBestTrailer(videos, rawId);
  },

  /**
   * Search movies and cast names
   */
  search: async (query: string): Promise<Movie[]> => {
    const q = query.toLowerCase().trim();
    if (!q) return SEED_MOVIES;

    // First search local seed data
    const localMatches = SEED_MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.genres.some((g) => g.toLowerCase().includes(q))
    );

    if (localMatches.length > 0) return localMatches;

    // Try live TMDB search if configured
    const live = await tmdbFetch<{ results: any[] }>("/search/movie", { query: q });
    if (live && live.results?.length > 0) {
      return live.results.map((m) => mapTmdbMovie(m));
    }

    return [];
  },

  /**
   * Fetch Person Details from TMDB or seed cast
   */
  getPersonDetails: async (personId: string): Promise<PersonDetails | null> => {
    const rawId = personId.replace(/^person-/, "");

    // Search seed cast records
    for (const movie of SEED_MOVIES) {
      const actor = movie.cast.find((c) => c.id === personId || c.id === `person-${rawId}`);
      if (actor) {
        // Collect filmography from seed
        const filmography = SEED_MOVIES.filter((m) =>
          m.cast.some((c) => c.name.toLowerCase() === actor.name.toLowerCase())
        ).map((m) => ({
          id: m.id,
          providerId: m.providerId,
          title: m.title,
          character: m.cast.find((c) => c.name.toLowerCase() === actor.name.toLowerCase())?.character,
          releaseDate: m.releaseDate,
          posterUrl: m.posterUrl,
          rating: m.rating,
          slug: m.slug,
        }));

        return {
          id: actor.id,
          providerId: Number(rawId) || undefined,
          name: actor.name,
          biography: `${actor.name} is a celebrated actor recognized for powerhouse performances in contemporary cinema, headlining critically acclaimed blockbusters and bringing depth to memorable characters.`,
          profilePath: actor.profilePath,
          profileUrl: actor.avatarUrl,
          knownForDepartment: "Acting",
          popularity: 88.5,
          filmography,
        };
      }
    }

    // Try live TMDB person endpoint
    if (/^\d+$/.test(rawId)) {
      const livePerson = await tmdbFetch<any>(`/person/${rawId}`, {
        append_to_response: "movie_credits",
      });
      if (livePerson) {
        const seenMovies = new Set<string>();
        const filmography: any[] = [];
        for (const m of (livePerson.movie_credits?.cast || [])) {
          const mId = `mov-tmdb-${m.id}`;
          if (!seenMovies.has(mId)) {
            seenMovies.add(mId);
            filmography.push({
              id: mId,
              providerId: m.id,
              title: m.title,
              character: m.character,
              releaseDate: m.release_date || "",
              posterUrl: imageService.getPosterUrl(m.poster_path, "w342", m.title),
              rating: Number((m.vote_average || 7).toFixed(1)),
              slug: m.title ? slugify(m.title) : `movie-${m.id}`,
            });
            if (filmography.length >= 10) break;
          }
        }

        return {
          id: `person-${livePerson.id}`,
          providerId: livePerson.id,
          name: livePerson.name,
          biography: livePerson.biography || "Celebrated artist in international cinema.",
          birthday: livePerson.birthday,
          placeOfBirth: livePerson.place_of_birth,
          profilePath: livePerson.profile_path,
          profileUrl: imageService.getProfileUrl(livePerson.profile_path, "h632", livePerson.name),
          knownForDepartment: livePerson.known_for_department || "Acting",
          popularity: livePerson.popularity,
          filmography,
        };
      }
    }

    return null;
  },
};
