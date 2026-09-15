import { CINEMAS } from "@/data/cinemas";
import { CITIES } from "@/data/cities";
import { Cinema, City } from "@/types/cinema";

export const cinemaService = {
  getCities: async (): Promise<City[]> => {
    return [...CITIES];
  },

  getPopularCities: async (): Promise<City[]> => {
    return CITIES.filter((c) => c.isPopular);
  },

  getCityById: async (cityId: string): Promise<City | null> => {
    return CITIES.find((c) => c.id === cityId) || null;
  },

  getCinemasByCity: async (cityId: string): Promise<Cinema[]> => {
    return CINEMAS.filter((c) => c.cityId === cityId);
  },

  getAllCinemas: async (): Promise<Cinema[]> => {
    return [...CINEMAS];
  },

  getCinemaBySlug: async (slug: string): Promise<Cinema | null> => {
    if (!slug) return null;
    const clean = slug.trim().toLowerCase();
    const withoutPrefix = clean.replace(/^(cin|th)-/, "");
    return (
      CINEMAS.find(
        (c) =>
          c.slug === clean ||
          c.id === clean ||
          c.id.replace(/^(cin|th)-/, "") === withoutPrefix ||
          c.slug.includes(withoutPrefix)
      ) || null
    );
  },

  searchCinemas: async (query: string, cityId?: string): Promise<Cinema[]> => {
    let list = cityId
      ? CINEMAS.filter((c) => c.cityId === cityId)
      : [...CINEMAS];

    if (!query.trim()) return list;

    const q = query.toLowerCase().trim();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  },
};
