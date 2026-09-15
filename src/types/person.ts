import { Movie } from "./movie";

export interface PersonFilmographyItem {
  id: string;
  providerId?: number;
  title: string;
  character?: string;
  job?: string;
  releaseDate: string;
  posterUrl: string;
  rating: number;
  slug: string;
}

export interface PersonDetails {
  id: string;
  providerId?: number;
  name: string;
  biography: string;
  birthday?: string;
  placeOfBirth?: string;
  profilePath?: string;
  profileUrl: string;
  knownForDepartment: string;
  popularity?: number;
  filmography: PersonFilmographyItem[];
}
