"use client";

import React, { useState, useEffect, use } from "react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { movieService } from "@/services/movieService";
import { showService } from "@/services/showService";
import { useCity } from "@/context/CityContext";
import { useBooking } from "@/context/BookingContext";
import { Movie } from "@/types/movie";
import { Show } from "@/types/booking";
import { Cinema } from "@/types/cinema";
import TrailerModal from "@/components/movies/TrailerModal";
import SeatQuantityModal from "@/components/booking/SeatQuantityModal";
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Film,
  Sparkles,
  Info,
} from "lucide-react";

interface CinemaShowGroup {
  cinema: Cinema;
  shows: Show[];
}

export default function MovieDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentCity, openCityModal } = useCity();
  const { initShowSelection, draft } = useBooking();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showGroups, setShowGroups] = useState<CinemaShowGroup[]>([]);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState<boolean>(false);

  // Load movie data with navigation race-condition guard
  useEffect(() => {
    let isCurrent = true;
    setIsTrailerOpen(false);
    setMovie(null);
    setLoading(true);

    async function load() {
      try {
        const m = await movieService.getMovieBySlug(resolvedParams.slug);
        if (!isCurrent) return;
        setMovie(m);
        if (m?.title) {
          document.title = `${m.title} | Showara`;
        }

        const dates = showService.getAvailableDates();
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    load();

    return () => {
      isCurrent = false;
      setIsTrailerOpen(false);
    };
  }, [resolvedParams.slug]);

  // Load showtimes whenever movie, city, or date changes
  useEffect(() => {
    async function loadShows() {
      if (!movie || !selectedDate) return;
      const groups = await showService.getShowsForMovieAndCity(
        movie.id,
        currentCity.id,
        selectedDate
      );
      setShowGroups(groups);
    }
    loadShows();
  }, [movie, currentCity.id, selectedDate]);

  const handleSelectShow = (cinema: Cinema, show: Show) => {
    if (!movie) return;
    setSelectedCinema(cinema);
    setSelectedShow(show);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmQuantity = (count: number) => {
    if (!movie || !selectedCinema || !selectedShow) return;
    initShowSelection(movie, selectedCinema, selectedShow, selectedDate, count);
    setIsQuantityModalOpen(false);
    router.push(`/book/${selectedShow.id}?date=${selectedDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
          <p className="text-xs text-[var(--text-muted)]">Loading movie experience...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <Film className="w-12 h-12 text-[var(--text-muted)] mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Movie Not Found</h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-sm">
          The requested title is currently not listed in our cinema schedule.
        </p>
        <Link
          href="/movies"
          className="mt-6 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Browse All Movies
        </Link>
      </div>
    );
  }

  const isUpcoming = movie.status === "upcoming";

  return (
    <div className="min-h-screen pb-16 pb-safe bg-[var(--bg-main)]">
      {/* Hero Backdrop Showcase */}
      <section className="relative w-full overflow-hidden bg-black min-h-[380px] md:min-h-[440px] flex items-end">
        <div className="absolute inset-0">
          <SafeImage
            src={movie.backdropUrl || movie.backdropPath}
            alt={movie.title}
            type="backdrop"
            fallbackTitle={movie.title}
            fill
            priority
            className="object-cover object-top opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe py-8 md:py-12 w-full flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
          {/* Poster Card */}
          <div className="relative w-44 sm:w-52 md:w-60 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-[var(--bg-surface-elevated)]">
            <SafeImage
              src={movie.posterUrl || movie.posterPath}
              alt={movie.title}
              type="poster"
              fallbackTitle={movie.title}
              fill
              priority
              className="object-cover"
            />
            {(movie.trailerYoutubeId || movie.trailerKey) && (
              <button
                type="button"
                onClick={() => setIsTrailerOpen(true)}
                className="absolute inset-0 bg-black/40 hover:bg-black/20 flex flex-col items-center justify-center gap-2 group transition-colors"
                aria-label="Play Trailer"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                  Trailer
                </span>
              </button>
            )}
          </div>

          {/* Movie Metadata */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] backdrop-blur-md border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] uppercase">
                {movie.certification}
              </span>
              {movie.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md bg-[var(--brand-primary)] text-white text-xs font-bold"
                >
                  {fmt}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                {movie.status === "now_showing" ? "Now In Theatres" : "Advance Premiere"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {movie.title}
            </h1>

            {/* Ratings & Duration Ribbon */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--text-secondary)] mt-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{movie.rating.toFixed(1)}/10</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">
                  ({(movie.ratingCount / 1000).toFixed(0)}k ratings)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(movie.durationMinutes / 60)}h{" "}
                  {movie.durationMinutes % 60}m
                </span>
              </div>
              <span>•</span>
              <span>{movie.genres.join(", ")}</span>
              <span>•</span>
              <span className="text-[var(--text-primary)] font-semibold">{movie.languages.join(", ")}</span>
            </div>

            {/* Synopsis Preview */}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-4 leading-relaxed max-w-2xl line-clamp-3">
              {movie.synopsis}
            </p>
          </div>
        </div>
      </section>

      {/* Main Container: Booking & Cast Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe py-8 space-y-12">
        {/* Date Selector Ribbon (Only if now showing or has dates) */}
        {!isUpcoming ? (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Select Date & Showtimes</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                  <span>Cinemas in </span>
                  <button
                    type="button"
                    onClick={openCityModal}
                    className="font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-0.5"
                  >
                    <span>{currentCity.name}</span>
                    <MapPin className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>

              {/* Legend for showtimes */}
              <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Fast Filling
                </span>
              </div>
            </div>

            {/* Date Ribbon Cards */}
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
                    <span className="text-[10px] font-bold tracking-wider opacity-90">{dayName}</span>
                    <span className="text-xl font-black mt-0.5">{dayNum}</span>
                    <span className="text-[10px] font-semibold opacity-75">{monthName}</span>
                  </button>
                );
              })}
            </div>

            {/* Cinemas and Shows List */}
            <div className="space-y-4 pt-4">
              {showGroups.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
                  <MapPin className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    No showtimes currently scheduled in {currentCity.name} for this date.
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Try selecting another date or switch your city to view nearby schedules.
                  </p>
                  <button
                    type="button"
                    onClick={openCityModal}
                    className="mt-4 px-4 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--brand-primary)] hover:border-[var(--brand-primary)]"
                  >
                    Change City
                  </button>
                </div>
              ) : (
                showGroups.map(({ cinema, shows }) => (
                  <div
                    key={cinema.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all"
                  >
                    {/* Cinema Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[var(--text-primary)]">{cinema.name}</h3>
                          {cinema.cancellationAllowed && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Cancellation Available
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{cinema.address}</p>
                      </div>

                      {/* Amenities chips */}
                      <div className="flex flex-wrap gap-1">
                        {cinema.facilities.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtime buttons grouped */}
                    <div className="pt-4 flex flex-wrap gap-2.5 sm:gap-3">
                      {shows.map((show) => (
                        <button
                          key={show.id}
                          type="button"
                          onClick={() => handleSelectShow(cinema, show)}
                          className="group flex flex-col items-center p-2.5 sm:p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-all touch-target min-w-[95px] sm:min-w-[110px]"
                        >
                          <span className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
                            {show.startTime}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {show.format} • {show.language}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                            From ₹{show.priceConfig.CLASSIC || 220}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          /* Upcoming Movie Announcement Card */
          <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-xl mx-auto">
            <Sparkles className="w-10 h-10 text-[var(--brand-secondary)] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Releasing on {new Date(movie.releaseDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Advance bookings for {movie.title} will open 3-5 days before the theatrical premiere. Stay tuned!
            </p>
          </div>
        )}

        {/* Cast and Crew Section */}
        <section className="space-y-6 pt-6 border-t border-[var(--border-subtle)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Cast & Characters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.cast.map((member) => (
              <Link
                key={member.id}
                href={`/people/${member.id}`}
                className="group flex flex-col items-center text-center p-3 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] group-hover:scale-105 transition-transform">
                  <SafeImage
                    src={member.avatarUrl || member.profilePath}
                    alt={member.name}
                    type="profile"
                    fallbackTitle={member.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">{member.name}</h4>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                  as {member.character}
                </p>
                <span className="text-[10px] text-[var(--brand-primary)] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Bio →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Crew Highlights */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Crew</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movie.crew.map((crew, idx) => (
              <div
                key={`${crew.id}-${crew.role || crew.job || idx}`}
                className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                  {crew.role}
                </span>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-1">{crew.name}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Trailer Dialog Modal */}
      <TrailerModal
        trailer={movie.trailer}
        youtubeId={movie.trailer?.key || movie.trailerYoutubeId || movie.trailerKey}
        movieTitle={movie.title}
        trailerName={movie.trailer?.name || movie.trailerName}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />

      {/* Seat Quantity Modal */}
      <SeatQuantityModal
        isOpen={isQuantityModalOpen}
        show={selectedShow}
        movie={movie}
        cinema={selectedCinema}
        initialCount={draft.targetSeatCount || 2}
        onConfirm={handleConfirmQuantity}
        onClose={() => setIsQuantityModalOpen(false)}
      />
    </div>
  );
}
