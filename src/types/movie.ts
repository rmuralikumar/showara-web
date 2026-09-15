export type MovieStatus = "now_showing" | "upcoming" | "ended";

export type MovieFormat = "2D" | "3D" | "IMAX 2D" | "IMAX 3D" | "4DX" | "Dolby Cinema";

export type MovieCertification = "U" | "UA" | "UA 13+" | "UA 16+" | "A";

export interface CastMember {
  id: string;
  name: string;
  character: string;
  role?: string;
  profilePath?: string;
  avatarUrl: string;
  order?: number;
}

export interface CrewMember {
  id: string;
  name: string;
  job?: string; // "Director", "Music Director", "Writer", "Cinematographer", etc.
  department?: string;
  role?: string;
  profilePath?: string;
  avatarUrl?: string;
}

export interface MovieTrailer {
  key: string;
  name: string;
  site: "YouTube";
  type: "Trailer" | "Teaser";
  official: boolean;
  movieId: number | string;
  source: "tmdb" | "verified_seed";
}

export interface Movie {
  id: string;
  providerId?: number; // TMDB Movie ID
  slug: string;
  title: string;
  originalTitle?: string;
  synopsis: string;
  overview?: string;
  posterPath?: string;
  poster_path?: string;
  backdropPath?: string;
  backdrop_path?: string;
  logoPath?: string;
  posterUrl: string;
  backdropUrl: string;
  trailer?: MovieTrailer | null;
  trailerYoutubeId?: string;
  trailerKey?: string;
  trailerName?: string;
  trailerUrl?: string;
  trailerSite?: "YouTube";
  trailerType?: "Trailer" | "Teaser";
  trailerOfficial?: boolean;
  trailerSource?: "TMDB" | "tmdb" | "verified_seed";
  trailers?: MovieTrailer[];
  rating: number; // TMDB / Overall rating e.g. 8.6
  ratingCount: number; // e.g. 42500
  voteCount?: number;
  tmdbRating?: number;
  showaraRating?: number;
  durationMinutes: number; // e.g. 165
  runtime?: number;
  releaseDate: string; // ISO date e.g. "2024-03-01"
  certification: MovieCertification;
  languages: string[]; // ["English", "Hindi", "Telugu", "Tamil"]
  originalLanguage?: string;
  formats: MovieFormat[];
  genres: string[]; // ["Action", "Sci-Fi", "Thriller"]
  status: MovieStatus;
  cast: CastMember[];
  crew: CrewMember[];
  director?: string;
  isFeatured?: boolean;
  trendingRank?: number;
  popularity?: number;
}
