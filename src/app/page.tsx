import React from "react";
import Link from "next/link";
import { movieService } from "@/services/movieService";
import { cinemaService } from "@/services/cinemaService";
import MovieHero from "@/components/movies/MovieHero";
import MovieCarousel from "@/components/movies/MovieCarousel";
import {
  Sparkles,
  MapPin,
  Film,
  Award,
  ChevronRight,
  Flame,
  Calendar,
  Compass,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default async function HomePage() {
  const [featuredMovies, nowShowing, trending, upcoming, popular, languages, genres, cinemas] =
    await Promise.all([
      movieService.getFeaturedMovies(),
      movieService.getNowShowing(),
      movieService.getTrending(),
      movieService.getUpcoming(),
      movieService.getPopular(),
      movieService.getDistinctLanguages(),
      movieService.getDistinctGenres(),
      cinemaService.getAllCinemas(),
    ]);

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full">
      {/* Featured Movie Hero Showcase */}
      <MovieHero featuredMovies={featuredMovies} />

      {/* Quick Discovery Chips: Languages & Genres */}
      <section className="py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 w-full max-w-full">
          {/* Languages ribbon */}
          <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden w-full max-w-full no-scrollbar py-1">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <Film className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              Languages:
            </span>
            <Link
              href="/movies"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/20 transition-all flex-shrink-0"
            >
              All Languages
            </Link>
            {languages.map((lang) => (
              <Link
                key={lang}
                href={`/movies?language=${encodeURIComponent(lang)}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all flex-shrink-0"
              >
                {lang}
              </Link>
            ))}
          </div>

          {/* Genres ribbon */}
          <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden w-full max-w-full no-scrollbar py-1">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Genres:
            </span>
            {genres.map((genre) => (
              <Link
                key={genre}
                href={`/movies?genre=${encodeURIComponent(genre)}`}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all flex-shrink-0"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <MovieCarousel
        title="Now Showing in Theatres"
        subtitle="Current theatrical releases with verified auditoriums & showtimes"
        movies={nowShowing}
        viewAllHref="/movies?status=now_showing"
      />

      {/* Trending Movies Section */}
      <MovieCarousel
        title="Trending This Week"
        subtitle="Most watched releases and audience favorites right now"
        movies={trending}
        viewAllHref="/movies?sortBy=popularity"
      />

      {/* A to Z Movie Directory Banner */}
      <section className="py-6 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)] w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0 font-black">
              A-Z
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                Browse Complete Filmography Directory
              </h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1 sm:line-clamp-none">
                Find any title alphabetically from A to Z across our verified cinema archive
              </p>
            </div>
          </div>
          <Link
            href="/movies/a-z"
            className="px-4 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-xs font-bold text-[var(--text-primary)] transition-all touch-target inline-flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
          >
            <span>Open A–Z Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Upcoming Movies Section */}
      <MovieCarousel
        title="Coming Soon to Cinemas"
        subtitle="Explore upcoming blockbusters and get ready for advance bookings"
        movies={upcoming}
        viewAllHref="/movies?status=upcoming"
      />

      {/* Popular Movies Section */}
      <MovieCarousel
        title="Top Rated & Critically Acclaimed"
        subtitle="Cinema masterpieces with top TMDB and audience ratings"
        movies={popular}
        viewAllHref="/movies?sortBy=rating"
      />

      {/* Showara Experience Spotlight Banner */}
      <section className="py-10 bg-gradient-to-b from-transparent via-[var(--bg-surface)] to-transparent w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="relative rounded-3xl p-6 sm:p-12 overflow-hidden border border-[var(--border-subtle)] bg-gradient-to-r from-[var(--bg-surface-elevated)] to-[var(--bg-surface-card)] shadow-2xl w-full max-w-full">
            {/* Background glowing orbs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--brand-primary)]/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[var(--brand-secondary)]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-xs font-bold uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4" />
                <span>The Cinematic Standard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-snug">
                Experience Cinema The Way Directors Intended
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                From high-contrast IMAX Laser projections to room-filling Dolby Atmos surround audio and plush luxury recliners, Showara connects you directly to premier auditorium formats across top cinema chains.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)]">IMAX® Laser</div>
                  <div className="text-xs text-[var(--text-muted)]">Crystal sharp projection</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)]">Dolby Atmos</div>
                  <div className="text-xs text-[var(--text-muted)]">360° spatial audio</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)]">4DX Motion</div>
                  <div className="text-xs text-[var(--text-muted)]">Sensory environmental effects</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[var(--text-primary)]">VIP Recliners</div>
                  <div className="text-xs text-[var(--text-muted)]">Plush, motorized seating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bengaluru Cinemas Directory Spotlight */}
      <section className="py-8 pb-16 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
                <span>Premier Bengaluru Cinemas</span>
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Verified operating screens across Koramangala, Whitefield, Lalbagh Road & more
              </p>
            </div>
            <Link
              href="/cinemas"
              className="text-xs sm:text-sm font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              <span>Explore All Cinemas</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cinemas.slice(0, 3).map((cinema) => (
              <div
                key={cinema.id}
                className="p-5 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                      {cinema.area}
                    </span>
                    {cinema.cancellationAllowed && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Cancellation Available
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">{cinema.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{cinema.address}</p>

                  {/* Facilities */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cinema.facilities.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {cinema.screens.length} Screens
                  </span>
                  <Link
                    href={`/cinemas/${cinema.slug}`}
                    className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1"
                  >
                    <span>View Showtimes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
