"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  viewAllHref?: string;
}

export default function MovieCarousel({
  title,
  subtitle,
  movies,
  viewAllHref,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe w-full max-w-full min-w-0">
        {/* Carousel Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-5 gap-2">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <span className="truncate">{title}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)] flex-shrink-0">
                {movies.length}
              </span>
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 truncate sm:whitespace-normal">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-xs sm:text-sm font-semibold text-[var(--brand-primary)] hover:underline mr-1 sm:mr-2 flex-shrink-0 whitespace-nowrap"
              >
                View All
              </Link>
            )}
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label={`Scroll ${title} left`}
              className="hidden md:flex p-2 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label={`Scroll ${title} right`}
              className="hidden md:flex p-2 rounded-xl bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Cards Container - Strictly bounded scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden w-full max-w-full no-scrollbar scroll-smooth pb-4 touch-pan-x min-w-0"
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="w-[145px] sm:w-[190px] md:w-[220px] flex-shrink-0 min-w-0"
            >
              <MovieCard movie={movie} priority={index < 3} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
