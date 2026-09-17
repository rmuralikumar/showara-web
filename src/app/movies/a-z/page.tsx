"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { movieService } from "@/services/movieService";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/movies/MovieCard";
import {
  Compass,
  Search,
  RotateCcw,
  Film,
  ChevronLeft,
  ChevronRight,
  Filter,
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

function AZDirectoryContent() {
  const searchParams = useSearchParams();
  const initialLetter = searchParams.get("letter") || "ALL";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await movieService.getAllMovies();
      setMovies(all);
      setLoading(false);
    }
    load();
  }, []);

  // Distinct genres and languages
  const allGenres = useMemo(() => {
    const s = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => s.add(g)));
    return ["All", ...Array.from(s)];
  }, [movies]);

  const allLanguages = useMemo(() => {
    const s = new Set<string>();
    movies.forEach((m) => m.languages.forEach((l) => s.add(l)));
    return ["All", ...Array.from(s)];
  }, [movies]);

  // Filter computation based on letter, search, genre, language, status
  const filtered = useMemo(() => {
    return movies.filter((m) => {
      // Letter filter
      if (selectedLetter !== "ALL") {
        if (selectedLetter === "#") {
          if (!/^[^a-zA-Z]/.test(m.title.trim())) return false;
        } else {
          if (!m.title.trim().toUpperCase().startsWith(selectedLetter.toUpperCase())) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesCast = m.cast.some((c) => c.name.toLowerCase().includes(q));
        const matchesDirector = m.director && m.director.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCast && !matchesDirector) return false;
      }

      // Genre
      if (selectedGenre !== "All" && !m.genres.includes(selectedGenre)) return false;

      // Language
      if (selectedLanguage !== "All" && !m.languages.includes(selectedLanguage)) return false;

      // Status
      if (selectedStatus !== "All" && m.status !== selectedStatus) return false;

      return true;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [movies, selectedLetter, searchQuery, selectedGenre, selectedLanguage, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLetter, searchQuery, selectedGenre, selectedLanguage, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen py-8 pb-16 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Alphabetical Index</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              A–Z Movie Directory
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Browse our complete library of real theatrical releases alphabetically
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, actor or director..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
            />
          </div>
        </div>

        {/* Alphabet Selector Pill Bar */}
        <div className="p-4 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-bold uppercase tracking-wider">Select Starting Letter:</span>
            <span>Active: <strong className="text-[var(--brand-primary)]">{selectedLetter}</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {ALPHABET.map((char) => {
              const isSelected = selectedLetter === char;
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => setSelectedLetter(char)}
                  className={`min-w-[34px] h-9 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
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

        {/* Quick Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <Filter className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Filter by:</span>
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
          >
            <option value="All">All Genres</option>
            {allGenres.filter((g) => g !== "All").map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
          >
            <option value="All">All Languages</option>
            {allLanguages.filter((l) => l !== "All").map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
          >
            <option value="All">All Statuses</option>
            <option value="now_showing">Now Showing</option>
            <option value="upcoming">Coming Soon</option>
          </select>

          {(selectedLetter !== "ALL" || selectedGenre !== "All" || selectedLanguage !== "All" || selectedStatus !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedLetter("ALL");
                setSelectedGenre("All");
                setSelectedLanguage("All");
                setSelectedStatus("All");
                setSearchQuery("");
              }}
              className="ml-auto text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Count & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{filtered.length}</strong> titles under{" "}
              <strong>{selectedLetter === "ALL" ? "All Letters" : `Letter "${selectedLetter}"`}</strong>
            </span>
            {totalPages > 1 && <span>Page {currentPage} of {totalPages}</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <Film className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                No titles found starting with &quot;{selectedLetter}&quot;
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try selecting another letter or clearing active filters.
              </p>
              <button
                type="button"
                onClick={() => setSelectedLetter("ALL")}
                className="mt-4 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
              >
                View All Titles
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 min-w-0 w-full">
                {paginated.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination */}
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

                  {/* Windowed Page Numbers on Tablet and Desktop */}
                  <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-8 flex items-center justify-center text-xs text-[var(--text-muted)]"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(Number(p))}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === p
                              ? "bg-[var(--brand-primary)] text-white shadow-sm"
                              : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
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
  );
}

export default function AZDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)]" />}>
      <AZDirectoryContent />
    </Suspense>
  );
}
