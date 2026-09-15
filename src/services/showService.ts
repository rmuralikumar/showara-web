import { BASE_SHOWS, getAvailableDates } from "@/data/shows";
import { CINEMAS } from "@/data/cinemas";
import { Show } from "@/types/booking";

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
          matching = [
            {
              id: `show-${movieId}-${cinema.id}-1`,
              movieId,
              cinemaId: cinema.id,
              screenId: screen.id,
              screenName: `${screen.name} - ${screen.format}`,
              date,
              startTime: "11:00",
              endTime: "13:30",
              language: "English",
              format: screen.format as any,
              priceConfig: { RECLINER: 450, PRIME: 320, CLASSIC: 220 },
              cancellationCutoffHours: 2,
            },
            {
              id: `show-${movieId}-${cinema.id}-2`,
              movieId,
              cinemaId: cinema.id,
              screenId: screen.id,
              screenName: `${screen.name} - ${screen.format}`,
              date,
              startTime: "15:30",
              endTime: "18:00",
              language: "English",
              format: screen.format as any,
              priceConfig: { RECLINER: 480, PRIME: 350, CLASSIC: 240 },
              cancellationCutoffHours: 2,
            },
            {
              id: `show-${movieId}-${cinema.id}-3`,
              movieId,
              cinemaId: cinema.id,
              screenId: screen.id,
              screenName: `${screen.name} - ${screen.format}`,
              date,
              startTime: "19:15",
              endTime: "21:45",
              language: "English",
              format: screen.format as any,
              priceConfig: { RECLINER: 520, PRIME: 380, CLASSIC: 260 },
              cancellationCutoffHours: 2,
            },
          ];
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
      return {
        id: showId,
        movieId: "mov-live-selected",
        cinemaId: cinema.id,
        screenId: screen?.id || "scr-default-1",
        screenName: screen?.name || "Audi 1",
        date: date || getAvailableDates(1)[0],
        startTime: "18:30",
        endTime: "21:00",
        language: "English",
        format: (screen?.format as any) || "2D",
        priceConfig: { RECLINER: 450, PRIME: 320, CLASSIC: 220 },
        cancellationCutoffHours: 2,
      };
    }

    return null;
  },
};
