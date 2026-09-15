import { Movie, MovieFormat, MovieStatus } from "@/types/movie";
import { tmdbClient } from "@/lib/tmdb";

export interface MovieFilterParams {
  query?: string;
  status?: MovieStatus;
  language?: string;
  genre?: string;
  format?: MovieFormat;
  letter?: string;
  sortBy?: "popularity" | "rating" | "releaseDate" | "title";
  page?: number;
  limit?: number;
}

const isBrowser = typeof window !== "undefined";

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[movieService] API fetch failed for ${endpoint}:`, err);
    return null;
  }
}

export const movieService = {
  getAllMovies: async (): Promise<Movie[]> => {
    if (isBrowser) {
      const data = await fetchApi<Movie[]>("/api/movies?limit=all");
      if (data && data.length > 0) return data;
    }
    return tmdbClient.getAllMovies();
  },

  getFeaturedMovies: async (): Promise<Movie[]> => {
    const all = await movieService.getAllMovies();
    return all.filter((m) => m.isFeatured || (m.trendingRank && m.trendingRank <= 5));
  },

  getNowShowing: async (): Promise<Movie[]> => {
    if (isBrowser) {
      const data = await fetchApi<Movie[]>("/api/movies?status=now_showing&limit=50");
      if (data && data.length > 0) return data;
    }
    return tmdbClient.getNowShowing();
  },

  getUpcoming: async (): Promise<Movie[]> => {
    if (isBrowser) {
      const data = await fetchApi<Movie[]>("/api/movies?status=upcoming&limit=50");
      if (data && data.length > 0) return data;
    }
    return tmdbClient.getUpcoming();
  },

  getTrending: async (): Promise<Movie[]> => {
    if (isBrowser) {
      const all = await movieService.getAllMovies();
      return [...all].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
    }
    return tmdbClient.getTrending();
  },

  getPopular: async (): Promise<Movie[]> => {
    if (isBrowser) {
      const all = await movieService.getAllMovies();
      return [...all].sort((a, b) => b.rating - a.rating);
    }
    return tmdbClient.getPopular();
  },

  getMovieBySlug: async (slugOrId: string): Promise<Movie | null> => {
    if (!slugOrId) return null;
    if (isBrowser) {
      const data = await fetchApi<Movie>(`/api/movies/${encodeURIComponent(slugOrId.trim())}`);
      if (data) return data;
    }
    return tmdbClient.getMovieBySlugOrId(slugOrId);
  },

  getMoviesByLetter: async (letter: string, page = 1, limit = 12): Promise<{ movies: Movie[]; total: number }> => {
    const all = await tmdbClient.getAllMovies();
    let filtered = all;

    if (letter && letter !== "ALL") {
      if (letter === "#") {
        filtered = all.filter((m) => /^[^a-zA-Z]/.test(m.title.trim()));
      } else {
        const char = letter.toUpperCase();
        filtered = all.filter((m) => m.title.trim().toUpperCase().startsWith(char));
      }
    }

    const start = (page - 1) * limit;
    return {
      movies: filtered.slice(start, start + limit),
      total: filtered.length,
    };
  },

  searchAndFilter: async (params: MovieFilterParams): Promise<Movie[]> => {
    let result = await tmdbClient.getAllMovies();

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.languages.some((l) => l.toLowerCase().includes(q)) ||
          m.cast.some((c) => c.name.toLowerCase().includes(q)) ||
          (m.director && m.director.toLowerCase().includes(q))
      );
    }

    if (params.status) {
      result = result.filter((m) => m.status === params.status);
    }

    if (params.letter && params.letter !== "ALL") {
      if (params.letter === "#") {
        result = result.filter((m) => /^[^a-zA-Z]/.test(m.title.trim()));
      } else {
        const char = params.letter.toUpperCase();
        result = result.filter((m) => m.title.trim().toUpperCase().startsWith(char));
      }
    }

    if (params.language && params.language !== "All") {
      result = result.filter((m) => Array.isArray(m.languages) && m.languages.includes(params.language!));
    }

    if (params.genre && params.genre !== "All") {
      result = result.filter((m) => Array.isArray(m.genres) && m.genres.some((g) => g.toLowerCase() === params.genre!.toLowerCase()));
    }

    if (params.format && params.format !== ("All" as any)) {
      result = result.filter((m) => Array.isArray(m.formats) && m.formats.includes(params.format!));
    }

    if (params.sortBy) {
      if (params.sortBy === "popularity") {
        result.sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
      } else if (params.sortBy === "rating") {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (params.sortBy === "releaseDate") {
        result.sort((a, b) => {
          const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return timeB - timeA;
        });
      } else if (params.sortBy === "title") {
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      }
    }

    return result;
  },

  getDistinctLanguages: async (): Promise<string[]> => {
    const all = await movieService.getAllMovies();
    const set = new Set<string>();
    all.forEach((m) => m.languages.forEach((l) => set.add(l)));
    return Array.from(set);
  },

  getDistinctGenres: async (): Promise<string[]> => {
    const all = await movieService.getAllMovies();
    const set = new Set<string>();
    all.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  },
};
