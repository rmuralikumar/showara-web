export interface City {
  id: string;
  name: string;
  state: string;
  slug?: string;
  tier?: string;
  latitude?: number;
  longitude?: number;
  isPopular?: boolean;
  pincodes?: string[];
  aliases?: string[];
  theatreLocations?: string[];
}

export type CinemaFacility =
  | "Dolby Atmos"
  | "IMAX with Laser"
  | "4DX"
  | "Recliner Seats"
  | "Wheelchair Accessible"
  | "Valet Parking"
  | "Parking"
  | "Food & Beverage Counter"
  | "4K RGB Laser Projection"
  | string;

export interface Screen {
  id: string;
  cinemaId: string;
  screenNumber?: number;
  name: string; // e.g. "Screen 1 - IMAX Laser"
  format: string;
  totalSeats: number;
}

export interface Cinema {
  id: string;
  slug: string;
  name: string;
  chain?: string;
  cityId: string;
  city?: string;
  address: string;
  area: string; // e.g. "Koramangala", "Whitefield", "Rajajinagar"
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  facilities: CinemaFacility[];
  screens: Screen[];
  phone?: string;
  cancellationAllowed?: boolean;
  active?: boolean;
  operatingStatus?: "OPERATING" | "TEMPORARILY_CLOSED";
  source?: string;
  sourceId?: string;
}
