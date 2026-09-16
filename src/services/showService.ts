import { BASE_SHOWS, getAvailableDates } from "@/data/shows";
import { CINEMAS } from "@/data/cinemas";
import { Show } from "@/types/booking";

export const DYNAMIC_SHOW_SLOTS: Record<
  string,
  {
    startTime: string;
    endTime: string;
    priceConfig: { RECLINER: number; PRIME: number; CLASSIC: number };
  }
> = {
  "1": {
    startTime: "11:00",
    endTime: "13:30",
    priceConfig: { RECLINER: 450, PRIME: 320, CLASSIC: 220 },
  },
  "2": {
    startTime: "15:30",
    endTime: "18:00",
    priceConfig: { RECLINER: 480, PRIME: 350, CLASSIC: 240 },
  },
  "3": {
    startTime: "19:15",
    endTime: "21:45",
    priceConfig: { RECLINER: 520, PRIME: 380, CLASSIC: 260 },
  },
};

export const showService = {
  getAvailableDates: (): string[] => {
    return getAvailableDates(7);
  },

  getShowsForMovieAndCity: async (
    movieId: string,
    cityId: string,
    date: string
  ): Promise<{ cinema: (typeof CINEMAS)[0]; shows: Show[] }[]> => {
    const cityCinemas = CINEMAS.filter((c) => c.cityId === cityId);

    return cityCinemas
      .map((cinema) => {
        const isDune = movieId === "mov-001" || movieId === "mov-dune-2" || movieId === "dune-part-two";
        const isKalki = movieId === "mov-003" || movieId === "mov-kalki-2898-ad" || movieId === "kalki-2898-ad";

        // Find matching scheduled shows for this movie and cinema
        let matching = BASE_SHOWS.filter(
          (s) =>
            (s.movieId === movieId ||
              s.movieId === `mov-${movieId}` ||
              s.movieId === movieId.replace(/^mov-tmdb-/, "mov-") ||
              s.movieId.includes(movieId) ||
              (isDune && s.movieId === "mov-dune-2") ||
              (isKalki && s.movieId === "mov-kalki-2898-ad")) &&
            s.cinemaId === cinema.id
        );

        // If this is a live TMDB movie without pre-seeded shows, generate verified showtimes
        if (matching.length === 0 && cinema.screens && cinema.screens.length > 0) {
          const screen = cinema.screens[0];
          matching = (["1", "2", "3"] as const).map((slotKey) => {
            const slot = DYNAMIC_SHOW_SLOTS[slotKey];
            return {
              id: `show-${movieId}-${cinema.id}-${slotKey}`,
              movieId,
              cinemaId: cinema.id,
              screenId: screen.id,
              screenName: `${screen.name} - ${screen.format}`,
              date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              language: "English",
              format: screen.format as any,
              priceConfig: { ...slot.priceConfig },
              cancellationCutoffHours: 2,
            };
          });
        }

        const datedShows = matching.map((s) => ({
          ...s,
          date,
        }));

        return {
          cinema,
          shows: datedShows,
        };
      })
      .filter((group) => group.shows.length > 0);
  },

  getShowById: async (showId: string, date?: string): Promise<Show | null> => {
    const show = BASE_SHOWS.find((s) => s.id === showId);
    if (show) {
      return {
        ...show,
        date: date || show.date || getAvailableDates(1)[0],
      };
    }

    // Dynamic show fallback for live TMDB titles
    if (showId && showId.startsWith("show-")) {
      const cinema = CINEMAS.find((c) => showId.includes(c.id)) || CINEMAS[0];
      const screen = cinema?.screens?.[0];

      // Extract slot number from suffix (e.g. "-1", "-2", "-3")
      const slotMatch = showId.match(/-([1-3])$/);
      const slotKey = slotMatch ? slotMatch[1] : "1";
      const slot = DYNAMIC_SHOW_SLOTS[slotKey] || DYNAMIC_SHOW_SLOTS["1"];

      // Extract movieId from showId: show-${movieId}-${cinema.id}-${slot}
      let extractedMovieId = "mov-live-selected";
      const idWithoutPrefix = showId.slice("show-".length);
      const cinemaIndex = idWithoutPrefix.indexOf(cinema.id);
      if (cinemaIndex > 1) {
        extractedMovieId = idWithoutPrefix.slice(0, cinemaIndex - 1);
      }

      return {
        id: showId,
        movieId: extractedMovieId,
        cinemaId: cinema.id,
        screenId: screen?.id || "scr-default-1",
        screenName: screen ? `${screen.name} - ${screen.format}` : "Audi 1",
        date: date || getAvailableDates(1)[0],
        startTime: slot.startTime,
        endTime: slot.endTime,
        language: "English",
        format: (screen?.format as any) || "2D",
        priceConfig: { ...slot.priceConfig },
        cancellationCutoffHours: 2,
      };
    }

    return null;
  },
};
