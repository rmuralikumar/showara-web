"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { MOVIES } from "@/data/movies";
import { CINEMAS } from "@/data/cinemas";
import { Search, Film, MapPin, Star, ArrowRight, X, Clock } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("showara_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // fallback
    }
  }, []);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const filtered = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(filtered);
    try {
      localStorage.setItem("showara_recent_searches", JSON.stringify(filtered));
    } catch {
      // fallback
    }
  };

  const removeRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem("showara_recent_searches", JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const matchingMovies = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MOVIES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)) ||
        m.languages.some((l) => l.toLowerCase().includes(q)) ||
        m.cast.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [query]);

  const matchingCinemas = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return CINEMAS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [query]);

  const popularSearches = [
    "Dune: Part Two",
    "Devara",
    "IMAX Laser",
    "Gladiator II",
    "Koramangala",
    "Telugu Action",
  ];

  return (
    <div className="min-h-screen py-8 bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveSearch(query)}
            placeholder="Search movies, cast, languages, or cinemas..."
            className="w-full pl-12 pr-10 py-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl text-base text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all shadow-lg"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-muted)] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* When no query typed: Recent & Trending Searches */}
        {!query.trim() && (
          <div className="mt-8 space-y-8 animate-fade-in">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Recent Searches</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-strong)] transition-all"
                    >
                      <span>{term}</span>
                      <X
                        className="w-3 h-3 text-[var(--text-muted)] hover:text-white"
                        onClick={(e) => removeRecent(term, e)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      saveSearch(term);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {query.trim() && (
          <div className="mt-8 space-y-10">
            {/* Movie Results */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Movies ({matchingMovies.length})</span>
                </h3>
              </div>

              {matchingMovies.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] py-2">
                  No movies found matching &quot;{query}&quot;
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      href={`/movies/${movie.slug}`}
                      onClick={() => saveSearch(movie.title)}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all group"
                    >
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
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
                        <h4 className="text-sm font-bold text-white group-hover:text-[var(--brand-primary)] truncate">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-white">{movie.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{movie.languages.slice(0, 2).join(", ")}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1 truncate">
                          {movie.genres.join(" • ")}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all mr-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cinema Results */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Cinemas ({matchingCinemas.length})</span>
                </h3>
              </div>

              {matchingCinemas.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] py-2">
                  No cinemas found matching &quot;{query}&quot;
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchingCinemas.map((cinema) => (
                    <Link
                      key={cinema.id}
                      href={`/cinemas/${cinema.slug}`}
                      onClick={() => saveSearch(cinema.name)}
                      className="p-4 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all group"
                    >
                      <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase">
                        {cinema.area}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-[var(--brand-primary)] mt-0.5 truncate">
                        {cinema.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                        {cinema.address}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {cinema.facilities.slice(0, 2).map((f) => (
                          <span
                            key={f}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)]" />}>
      <SearchContent />
    </Suspense>
  );
}
