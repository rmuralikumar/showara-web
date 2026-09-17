"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movieService } from "@/services/movieService";
import { Movie, MovieFormat, MovieStatus } from "@/types/movie";
import MovieCard from "@/components/movies/MovieCard";
import {
  Filter,
  SlidersHorizontal,
  Sparkles,
  Film,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";

const ALPHABET = [
  "ALL",
  "#",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const ITEMS_PER_PAGE = 12;

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function MoviesContent() {
  const searchParams = useSearchParams();

  // Initial state from URL parameters
  const initialStatus = (searchParams.get("status") as MovieStatus) || "All";
  const initialLanguage = searchParams.get("language") || "All";
  const initialGenre = searchParams.get("genre") || "All";
  const initialFormat = searchParams.get("format") || "All";
  const initialLetter = searchParams.get("letter") || "ALL";

  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedFormat, setSelectedFormat] = useState<string>(initialFormat);
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load real movies
  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await movieService.getAllMovies();
      setMoviesList(all);
      setLoading(false);
    }
    load();
  }, []);

  // Sync state if URL params change
  useEffect(() => {
    if (searchParams.get("status")) setSelectedStatus(searchParams.get("status")!);
    if (searchParams.get("language")) setSelectedLanguage(searchParams.get("language")!);
    if (searchParams.get("genre")) setSelectedGenre(searchParams.get("genre")!);
    if (searchParams.get("format")) setSelectedFormat(searchParams.get("format")!);
    if (searchParams.get("letter")) setSelectedLetter(searchParams.get("letter")!);
  }, [searchParams]);

  // Extract distinct filters dynamically from real data
  const allLanguages = useMemo(() => {
    const s = new Set<string>();
    moviesList.forEach((m) => m.languages.forEach((l) => s.add(l)));
    return ["All", ...Array.from(s)];
  }, [moviesList]);

  const allGenres = useMemo(() => {
    const s = new Set<string>();
    moviesList.forEach((m) => m.genres.forEach((g) => s.add(g)));
    return ["All", ...Array.from(s)];
  }, [moviesList]);

  const allFormats = ["All", "IMAX 2D", "2D", "3D", "IMAX 3D", "4DX", "Dolby Cinema"];

  // Filter and sort computation
  const filteredMovies = useMemo(() => {
    return moviesList
      .filter((movie) => {
        // Search query (title, cast, director, genres)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = movie.title.toLowerCase().includes(q);
          const matchesCast = movie.cast.some((c) => c.name.toLowerCase().includes(q));
          const matchesDirector = movie.director && movie.director.toLowerCase().includes(q);
          const matchesGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesCast && !matchesDirector && !matchesGenre) return false;
        }

        // A-Z Letter Filter
        if (selectedLetter && selectedLetter !== "ALL") {
          if (selectedLetter === "#") {
            if (!/^[^a-zA-Z]/.test(movie.title.trim())) return false;
          } else {
            const char = selectedLetter.toUpperCase();
            if (!movie.title.trim().toUpperCase().startsWith(char)) return false;
          }
        }

        // Status
        if (selectedStatus !== "All" && movie.status !== selectedStatus) {
          return false;
        }

        // Language
        if (selectedLanguage !== "All" && !movie.languages.includes(selectedLanguage)) {
          return false;
        }

        // Genre
        if (selectedGenre !== "All" && !movie.genres.includes(selectedGenre)) {
          return false;
        }

        // Format
        if (selectedFormat !== "All" && !movie.formats.includes(selectedFormat as MovieFormat)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popularity") return (a.trendingRank || 99) - (b.trendingRank || 99);
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "releaseDate")
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [
    moviesList,
    searchQuery,
    selectedLetter,
    selectedStatus,
    selectedLanguage,
    selectedGenre,
    selectedFormat,
    sortBy,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedLetter,
    selectedStatus,
    selectedLanguage,
    selectedGenre,
    selectedFormat,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedStatus("All");
    setSelectedLanguage("All");
    setSelectedGenre("All");
    setSelectedFormat("All");
    setSelectedLetter("ALL");
    setSearchQuery("");
    setSortBy("popularity");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedStatus !== "All" ||
    selectedLanguage !== "All" ||
    selectedGenre !== "All" ||
    selectedFormat !== "All" ||
    selectedLetter !== "ALL" ||
    searchQuery !== "";

  // Pagination slice
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE) || 1;
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen py-8 pb-12 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold uppercase tracking-wider mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>Real Movie Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Explore Cinema
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Discover verified blockbusters, IMAX releases, and advance theatrical premieres
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, actor, or director..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Top Rated (TMDB)</option>
                <option value="releaseDate">Release Date</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] rounded-xl touch-target"
            >
              <SlidersHorizontal className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
              )}
            </button>
          </div>
        </div>

        {/* A–Z Alphabet Navigation Bar */}
        <div className="p-3 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>A–Z Movie Directory</span>
            </span>
            {selectedLetter !== "ALL" && (
              <span className="text-xs text-[var(--brand-primary)] font-semibold">
                Letter: <strong>{selectedLetter}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {ALPHABET.map((char) => {
              const isSelected = selectedLetter === char;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => setSelectedLetter(char)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary-glow)] scale-105"
                      : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout: Filter Sidebar + Movie Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 min-w-0 w-full">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] h-fit sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                <Filter className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                Release Status
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "All", value: "All" },
                  { label: "Now Showing", value: "now_showing" },
                  { label: "Coming Soon", value: "upcoming" },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setSelectedStatus(st.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedStatus === st.value
                        ? "bg-[var(--brand-primary)] text-white font-bold"
                        : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                Languages
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allLanguages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedLanguage === lang
                        ? "bg-[var(--brand-primary)] text-white font-bold"
                        : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                Genres
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedGenre === genre
                        ? "bg-[var(--brand-primary)] text-white font-bold"
                        : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                Experience / Format
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedFormat === fmt
                        ? "bg-[var(--brand-primary)] text-white font-bold"
                        : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Movie Grid */}
          <div className="lg:col-span-3 space-y-6 min-w-0 w-full">
            <div className="flex items-center justify-between min-w-0">
              <span className="text-xs text-[var(--text-muted)] truncate">
                Showing <strong className="text-[var(--text-primary)]">{filteredMovies.length}</strong> verified titles
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {filteredMovies.length === 0 ? (
              <div className="p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
                <Film className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  No movies match your criteria
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                  Try clearing your letter or genre filters to discover more releases currently in our real database.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold hover:brightness-110 transition-all touch-target"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 min-w-0 w-full">
                  {paginatedMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed touch-target"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {/* Compact Page Counter on Mobile (< 640px) */}
                    <span className="sm:hidden text-xs font-semibold px-2 text-[var(--text-muted)]">
                      Page {currentPage} of {totalPages}
                    </span>

                    {/* Windowed Page Number Buttons on Tablet / Desktop */}
                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                        typeof p === "number" ? (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              currentPage === p
                                ? "bg-[var(--brand-primary)] text-white shadow-sm"
                                : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-8 flex items-center justify-center text-xs text-[var(--text-muted)]"
                          >
                            ...
                          </span>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed touch-target"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden flex justify-end"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-[var(--bg-surface-elevated)] h-full p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span className="text-base font-bold text-[var(--text-primary)]">Filters</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Close
                </button>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Status</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "now_showing", "upcoming"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedStatus === s
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--bg-surface-card)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {s === "now_showing" ? "Now Showing" : s === "upcoming" ? "Coming Soon" : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Language</h4>
                <div className="flex flex-wrap gap-1.5">
                  {allLanguages.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setSelectedLanguage(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedLanguage === l
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--bg-surface-card)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formats */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Format</h4>
                <div className="flex flex-wrap gap-1.5">
                  {allFormats.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFormat(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        selectedFormat === f
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--bg-surface-card)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-xs shadow-md"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-2.5 rounded-xl bg-[var(--bg-surface-card)] text-[var(--text-secondary)] font-semibold text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)]" />}>
      <MoviesContent />
    </Suspense>
  );
}
