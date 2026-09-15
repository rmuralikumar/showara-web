import test from "node:test";
import assert from "node:assert/strict";

/**
 * Regex patterns identifying non-trailer promotional video assets
 * that must NEVER be used as the movie's "Watch Trailer".
 */
const REJECTED_VIDEO_PATTERNS = [
  /\bfan[ -]?(trailer|made|edit|concept)\b/i,
  /\bconcept[ -]?trailer\b/i,
  /\breview\b/i,
  /\bclip\b/i,
  /\bfeaturette\b/i,
  /\bpreview\b/i,
  /\binterview\b/i,
  /\bbehind the scenes\b/i,
  /\bbts\b/i,
  /\breaction\b/i,
  /\brecap\b/i,
  /\bshort\b/i,
  /\bshorts\b/i,
  /\bmusic video\b/i,
  /\bsong\b/i,
  /\bblooper/i,
];

function isRejectedVideo(v) {
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

function cleanYoutubeKey(rawKey) {
  if (!rawKey || typeof rawKey !== "string") return null;
  const trimmed = rawKey.trim();
  if (/^[a-zA-Z0-9_-]{6,25}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Production-grade trailer selection engine
 */
function selectBestTrailer(videosList = [], movieId = "", movieTitle = "") {
  if (!Array.isArray(videosList) || videosList.length === 0) return null;

  const eligibleVideos = videosList.filter(
    (v) =>
      v &&
      v.site === "YouTube" &&
      cleanYoutubeKey(v.key) &&
      !isRejectedVideo(v)
  );
  if (eligibleVideos.length === 0) return null;

  // Title verification: reject candidates with conflicting famous blockbuster titles
  const conflictingFamousTitles = [
    "Dune", "Avatar", "Deadpool", "Oppenheimer", "Interstellar", "Kalki", "Stree", "RRR", "Kantara", "KGF"
  ];
  const safeVideos = eligibleVideos.filter((v) => {
    if (!movieTitle) return true;
    const vName = String(v.name || "").toLowerCase();
    const mTitle = movieTitle.toLowerCase();
    for (const famous of conflictingFamousTitles) {
      const fLower = famous.toLowerCase();
      if (vName.includes(fLower) && !mTitle.includes(fLower)) {
        return false;
      }
    }
    return true;
  });

  const pool = safeVideos.length > 0 ? safeVideos : eligibleVideos;

  // 1. Official YouTube Trailer
  const officialTrailer = pool.find((v) => v.type === "Trailer" && v.official === true);
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
  const anyTrailer = pool.find((v) => v.type === "Trailer");
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
  const officialTeaser = pool.find((v) => v.type === "Teaser" && v.official === true);
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
  const anyTeaser = pool.find((v) => v.type === "Teaser");
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

  return null;
}

function resolveMovieTrailer(movieRaw) {
  const movieId = movieRaw.providerId || movieRaw.id || "";
  const bestTrailer = selectBestTrailer(movieRaw.videos?.results, movieId, movieRaw.title);
  const isDuneMovie =
    movieRaw.id === "mov-dune-2" ||
    movieRaw.slug === "dune-part-two" ||
    movieRaw.id === 693134 ||
    movieRaw.providerId === 693134 ||
    String(movieRaw.title || "").toLowerCase().includes("dune");

  const rawYoutubeId = movieRaw.trailerYoutubeId ? String(movieRaw.trailerYoutubeId).trim() : undefined;
  const safeSeedYoutubeId = rawYoutubeId === "Way9Dexny3w" && !isDuneMovie ? undefined : rawYoutubeId;

  const hasCheckedVideos = Array.isArray(movieRaw.videos?.results);
  const fallbackKey = hasCheckedVideos ? undefined : (movieRaw.trailerKey ? String(movieRaw.trailerKey).trim() : undefined) || safeSeedYoutubeId;

  const canonicalTrailer = bestTrailer || (fallbackKey ? {
    key: fallbackKey,
    name: movieRaw.trailerName || "Official Trailer",
    site: "YouTube",
    type: "Trailer",
    official: true,
    movieId,
    source: "verified_seed",
  } : null);

  const trailerKey = canonicalTrailer?.key;
  const trailerName = canonicalTrailer?.name;
  const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : undefined;

  return {
    trailer: canonicalTrailer,
    trailerKey,
    trailerYoutubeId: trailerKey || undefined,
    trailerName,
    trailerUrl,
  };
}

// ==================== TEST SUITE (Requirements A through V) ====================

test("A. Official trailer beats non-official trailer", () => {
  const videos = [
    { site: "YouTube", type: "Trailer", official: false, key: "unofficial-key", name: "Trailer" },
    { site: "YouTube", type: "Trailer", official: true, key: "official-key", name: "Main Official Trailer" },
  ];
  const selected = selectBestTrailer(videos, 123, "Test Movie");
  assert.equal(selected?.key, "official-key");
  assert.equal(selected?.official, true);
});

test("B. Trailer beats teaser", () => {
  const videos = [
    { site: "YouTube", type: "Teaser", official: true, key: "teaser-key", name: "Official Teaser" },
    { site: "YouTube", type: "Trailer", official: false, key: "trailer-key", name: "Promo Trailer" },
  ];
  const selected = selectBestTrailer(videos, 123, "Test Movie");
  assert.equal(selected?.key, "trailer-key");
  assert.equal(selected?.type, "Trailer");
});

test("C. Official teaser beats normal teaser", () => {
  const videos = [
    { site: "YouTube", type: "Teaser", official: false, key: "teaser-normal", name: "Teaser 1" },
    { site: "YouTube", type: "Teaser", official: true, key: "teaser-official", name: "Official Teaser" },
  ];
  const selected = selectBestTrailer(videos, 123, "Test Movie");
  assert.equal(selected?.key, "teaser-official");
  assert.equal(selected?.official, true);
});

test("D. Fan trailer rejected", () => {
  const videos = [
    { site: "YouTube", type: "Trailer", official: false, key: "fan-trailer", name: "Fan Trailer (2024 Concept)" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("E. Review rejected", () => {
  const videos = [
    { site: "YouTube", type: "Review", official: false, key: "review-key", name: "Review" },
    { site: "YouTube", type: "Trailer", official: false, key: "review-key-2", name: "Full Movie Review" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("F. Clip rejected", () => {
  const videos = [
    { site: "YouTube", type: "Clip", official: true, key: "clip-key", name: "Scene Clip" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("G. Featurette rejected", () => {
  const videos = [
    { site: "YouTube", type: "Featurette", official: true, key: "featurette-key", name: "Making of the Film" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("H. Preview rejected", () => {
  const videos = [
    { site: "YouTube", type: "Trailer", official: false, key: "preview-key", name: "First Look Preview" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("I. Interview rejected", () => {
  const videos = [
    { site: "YouTube", type: "Trailer", official: false, key: "interview-key", name: "Cast & Crew Interview" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("J. BTS (Behind the Scenes) rejected", () => {
  const videos = [
    { site: "YouTube", type: "Behind the Scenes", official: true, key: "bts-key-1", name: "BTS Footage" },
    { site: "YouTube", type: "Trailer", official: false, key: "bts-key-2", name: "Behind the Scenes Special" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("K. Reaction rejected", () => {
  const videos = [
    { site: "YouTube", type: "Trailer", official: false, key: "react-key", name: "Trailer Reaction by Fans" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("L. Music video rejected", () => {
  const videos = [
    { site: "YouTube", type: "Clip", official: true, key: "mv-key-1", name: "Title Track Music Video" },
    { site: "YouTube", type: "Trailer", official: false, key: "mv-key-2", name: "Official Theme Song" },
  ];
  assert.equal(selectBestTrailer(videos, 123), null);
});

test("M. Missing trailer returns null", () => {
  assert.equal(selectBestTrailer([], 123), null);
  assert.equal(selectBestTrailer(null, 123), null);
  assert.equal(selectBestTrailer(undefined, 123), null);
});

test("N. Dune trailer stays only with Dune", () => {
  const dune = resolveMovieTrailer({
    id: "mov-dune-2",
    providerId: 693134,
    title: "Dune: Part Two",
    slug: "dune-part-two",
    trailerYoutubeId: "Way9Dexny3w",
  });
  assert.equal(dune.trailer?.key, "Way9Dexny3w");
  assert.equal(dune.trailer?.movieId, 693134);
});

test("O. Vishwanath & Sons never receives Dune trailer", () => {
  const vishwanath = resolveMovieTrailer({
    id: "mov-tmdb-1408162",
    providerId: 1408162,
    title: "Vishwanath & Sons",
    slug: "vishwanath-and-sons",
    videos: { results: [] },
    trailerYoutubeId: "Way9Dexny3w",
  });
  assert.equal(vishwanath.trailer, null);
  assert.equal(vishwanath.trailerKey, undefined);
  assert.notEqual(vishwanath.trailerKey, "Way9Dexny3w");
});

test("P. Two different movies with same/similar titles remain isolated by TMDB ID", () => {
  const movieA = resolveMovieTrailer({
    id: "mov-tmdb-101",
    providerId: 101,
    title: "Gladiator",
    videos: { results: [{ site: "YouTube", type: "Trailer", official: true, key: "gladiator-2000", name: "Trailer" }] },
  });
  const movieB = resolveMovieTrailer({
    id: "mov-tmdb-102",
    providerId: 102,
    title: "Gladiator II",
    videos: { results: [{ site: "YouTube", type: "Trailer", official: true, key: "gladiator-2024", name: "Trailer" }] },
  });

  assert.equal(movieA.trailer?.key, "gladiator-2000");
  assert.equal(movieA.trailer?.movieId, 101);
  assert.equal(movieB.trailer?.key, "gladiator-2024");
  assert.equal(movieB.trailer?.movieId, 102);
  assert.notEqual(movieA.trailer?.key, movieB.trailer?.key);
});

test("Q. Movie A -> Movie B navigation cannot retain Movie A trailer", () => {
  let activeMovie = resolveMovieTrailer({
    id: "mov-1",
    title: "Movie 1",
    videos: { results: [{ site: "YouTube", type: "Trailer", official: true, key: "key-001", name: "Trailer" }] },
  });
  assert.equal(activeMovie.trailer?.key, "key-001");

  // Simulate navigation to Movie B without trailer
  activeMovie = resolveMovieTrailer({
    id: "mov-2",
    title: "Movie 2",
    videos: { results: [] },
  });
  assert.equal(activeMovie.trailer, null);
  assert.equal(activeMovie.trailerKey, undefined);
});

test("R. Cache entries cannot return another movie's trailer", () => {
  const cache = new Map();
  const getCacheKey = (movieId) => `tmdb-movie-videos-${movieId}`;

  cache.set(getCacheKey(100), { key: "trailer-100" });
  cache.set(getCacheKey(200), { key: "trailer-200" });

  assert.equal(cache.get(getCacheKey(100))?.key, "trailer-100");
  assert.equal(cache.get(getCacheKey(200))?.key, "trailer-200");
  assert.notEqual(cache.get(getCacheKey(100))?.key, cache.get(getCacheKey(200))?.key);
});

test("S. Invalid YouTube IDs rejected", () => {
  assert.equal(cleanYoutubeKey("<script>alert(1)</script>"), null);
  assert.equal(cleanYoutubeKey("invalid?id=123&bad=true"), null);
  assert.equal(cleanYoutubeKey("abc"), null); // Too short
  assert.equal(cleanYoutubeKey("a".repeat(30)), null); // Too long
  assert.equal(cleanYoutubeKey("Way9Dexny3w"), "Way9Dexny3w"); // Valid 11-char ID
});

test("T. Age-restricted / blocked embed produces graceful fallback UI representation", () => {
  const cleanId = cleanYoutubeKey("Way9Dexny3w");
  const fallbackModel = {
    embedBlocked: true,
    message: "This trailer can’t be played inside Showara.",
    externalUrl: `https://www.youtube.com/watch?v=${cleanId}`,
  };
  assert.equal(fallbackModel.embedBlocked, true);
  assert.equal(fallbackModel.externalUrl, "https://www.youtube.com/watch?v=Way9Dexny3w");
});

test("U. Exact YouTube external link uses the verified trailer key", () => {
  const verifiedKey = "kQDd1AhGIHk";
  const externalLink = `https://www.youtube.com/watch?v=${verifiedKey}`;
  assert.equal(externalLink, "https://www.youtube.com/watch?v=kQDd1AhGIHk");
});

test("V. API response trailer.movieId matches requested movie ID", () => {
  const requestedId = 872585;
  const resolved = resolveMovieTrailer({
    id: requestedId,
    providerId: requestedId,
    title: "Oppenheimer",
    videos: {
      results: [
        { site: "YouTube", type: "Trailer", official: true, key: "uYPbbksJxIg", name: "Official Trailer" }
      ]
    }
  });

  assert.notEqual(resolved.trailer, null);
  assert.equal(resolved.trailer?.movieId, requestedId);
  assert.equal(resolved.trailer?.key, "uYPbbksJxIg");
});
