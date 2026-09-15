"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { cinemaService } from "@/services/cinemaService";
import { movieService } from "@/services/movieService";
import { showService } from "@/services/showService";
import { useBooking } from "@/context/BookingContext";
import { Cinema } from "@/types/cinema";
import { Movie } from "@/types/movie";
import { Show } from "@/types/booking";
import SeatQuantityModal from "@/components/booking/SeatQuantityModal";
import {
  MapPin,
  Clapperboard,
  ShieldCheck,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Phone,
} from "lucide-react";

export default function CinemaDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { initShowSelection, draft } = useBooking();

  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const c = await cinemaService.getCinemaBySlug(resolvedParams.slug);
      setCinema(c);

      const m = await movieService.getNowShowing();
      setMovies(m);

      const dates = showService.getAvailableDates();
      setAvailableDates(dates);
      if (dates.length > 0) setSelectedDate(dates[0]);

      setLoading(false);
    }
    load();
  }, [resolvedParams.slug]);

  const handleSelectShow = (movie: Movie, show: Show) => {
    if (!cinema) return;
    setSelectedMovie(movie);
    setSelectedShow(show);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmQuantity = (count: number) => {
    if (!cinema || !selectedMovie || !selectedShow) return;
    initShowSelection(selectedMovie, cinema, selectedShow, selectedDate, count);
    setIsQuantityModalOpen(false);
    router.push(`/book/${selectedShow.id}?date=${selectedDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-main)]">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <Clapperboard className="w-12 h-12 text-[var(--text-muted)] mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Cinema Not Found</h2>
        <Link
          href="/cinemas"
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Browse All Cinemas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cinema Overview Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                  {cinema.area}
                </span>
                {cinema.cancellationAllowed && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cancellation Available</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{cinema.name}</h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-xl leading-relaxed flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                <span>{cinema.address}</span>
              </p>
              {cinema.phone && (
                <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{cinema.phone}</span>
                </p>
              )}
            </div>

            {/* Facilities badges */}
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {cinema.facilities.map((fac) => (
                <span
                  key={fac}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Date Ribbon */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Select Date</span>
          </h2>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
            {availableDates.map((dStr, idx) => {
              const dateObj = new Date(dStr + "T00:00:00");
              const dayName = idx === 0 ? "TODAY" : idx === 1 ? "TOMORROW" : dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
              const dayNum = dateObj.getDate();
              const monthName = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const isSelected = dStr === selectedDate;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => setSelectedDate(dStr)}
                  className={`flex flex-col items-center justify-center min-w-[76px] py-3 px-2 rounded-2xl border transition-all touch-target ${
                    isSelected
                      ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-lg shadow-[var(--brand-primary-glow)] scale-105"
                      : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <span className="text-[10px] font-bold opacity-90">{dayName}</span>
                  <span className="text-xl font-black mt-0.5">{dayNum}</span>
                  <span className="text-[10px] font-semibold opacity-75">{monthName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Movies Playing List */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Movies Showing at this Cinema</h2>

          <div className="space-y-6">
            {movies.map((movie) => {
              // Construct showtimes for this movie in this cinema
              const sampleShows: Show[] = [
                {
                  id: `show-cin-${cinema.id}-${movie.id}-1`,
                  movieId: movie.id,
                  cinemaId: cinema.id,
                  screenId: cinema.screens[0]?.id || "s1",
                  screenName: cinema.screens[0]?.name || "Audi 1",
                  date: selectedDate,
                  startTime: "12:30",
                  endTime: "15:15",
                  language: movie.languages[0] || "Hindi",
                  format: movie.formats[0] || "2D",
                  priceConfig: { RECLINER: 480, PRIME: 340, CLASSIC: 220 },
                  cancellationCutoffHours: 2,
                },
                {
                  id: `show-cin-${cinema.id}-${movie.id}-2`,
                  movieId: movie.id,
                  cinemaId: cinema.id,
                  screenId: cinema.screens[0]?.id || "s1",
                  screenName: cinema.screens[0]?.name || "Audi 1",
                  date: selectedDate,
                  startTime: "16:45",
                  endTime: "19:30",
                  language: movie.languages[0] || "Hindi",
                  format: movie.formats[0] || "2D",
                  priceConfig: { RECLINER: 520, PRIME: 360, CLASSIC: 240 },
                  cancellationCutoffHours: 2,
                },
                {
                  id: `show-cin-${cinema.id}-${movie.id}-3`,
                  movieId: movie.id,
                  cinemaId: cinema.id,
                  screenId: cinema.screens[1]?.id || cinema.screens[0]?.id || "s2",
                  screenName: cinema.screens[1]?.name || "Audi 2",
                  date: selectedDate,
                  startTime: "20:30",
                  endTime: "23:15",
                  language: movie.languages[1] || movie.languages[0] || "English",
                  format: movie.formats[1] || movie.formats[0] || "2D",
                  priceConfig: { RECLINER: 560, PRIME: 380, CLASSIC: 250 },
                  cancellationCutoffHours: 2,
                },
              ];

              return (
                <div
                  key={movie.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] flex flex-col md:flex-row gap-6 items-start"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative w-24 aspect-[2/3] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10 hidden sm:block">
                    <SafeImage
                      src={movie.posterUrl}
                      alt={movie.title}
                      type="poster"
                      fallbackTitle={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] uppercase">
                        {movie.certification}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {movie.genres.join(", ")}
                      </span>
                    </div>

                    <Link href={`/movies/${movie.slug}`}>
                      <h3 className="text-base font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors">
                        {movie.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                      <span>•</span>
                      <span>{movie.languages.join(", ")}</span>
                    </div>

                    {/* Showtimes for this movie */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border-subtle)]">
                      {sampleShows.map((show) => (
                        <button
                          key={show.id}
                          type="button"
                          onClick={() => handleSelectShow(movie, show)}
                          className="flex flex-col items-center p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-all touch-target min-w-[100px]"
                        >
                          <span className="text-sm font-black text-[var(--text-primary)]">{show.startTime}</span>
                          <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {show.format} • {show.language}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹{show.priceConfig.CLASSIC}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Seat Quantity Modal */}
      <SeatQuantityModal
        isOpen={isQuantityModalOpen}
        show={selectedShow}
        movie={selectedMovie}
        cinema={cinema}
        initialCount={draft.targetSeatCount || 2}
        onConfirm={handleConfirmQuantity}
        onClose={() => setIsQuantityModalOpen(false)}
      />
    </div>
  );
}
