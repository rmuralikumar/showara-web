"use client";

import React, { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import Link from "next/link";
import { Movie } from "@/types/movie";
import { Play, Ticket, Star, Clock, ChevronRight, ChevronLeft, Film } from "lucide-react";
import TrailerModal from "./TrailerModal";

interface MovieHeroProps {
  featuredMovies: Movie[];
}

export default function MovieHero({ featuredMovies }: MovieHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];

  const handleNext = () => {
    setIsTrailerOpen(false);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setIsTrailerOpen(false);
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleSelectSlide = (idx: number) => {
    setIsTrailerOpen(false);
    setCurrentIndex(idx);
  };

  const hasTrailer = Boolean(currentMovie.trailerYoutubeId || currentMovie.trailerKey);

  return (
    <section className="relative w-full overflow-hidden bg-black py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe">
        <div className="relative rounded-3xl overflow-hidden min-h-[460px] md:min-h-[520px] flex items-end border border-[var(--border-subtle)] shadow-2xl bg-black">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <SafeImage
              src={currentMovie.backdropUrl || currentMovie.backdropPath}
              alt={currentMovie.title}
              type="backdrop"
              fallbackTitle={currentMovie.title}
              fill
              priority
              className="object-cover object-center brightness-90 transition-all duration-700"
            />
            {/* Guaranteed theme-independent dark gradient scrims for optimal WCAG AA contrast in both light & dark mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent hidden md:block pointer-events-none" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-5 sm:p-10 md:p-14 max-w-2xl flex flex-col justify-end">
            {/* Tagline / Formats Chip with solid semi-opaque background for contrast */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-[var(--brand-primary)] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                Featured Release
              </span>
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/25 text-white text-xs font-semibold shadow-sm">
                {currentMovie.certification}
              </span>
              {currentMovie.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white/95 text-xs border border-white/20 font-medium shadow-sm"
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-md">
              {currentMovie.title}
            </h1>

            {/* Meta Ribbon */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-xs sm:text-sm text-white/90 mb-4">
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md border border-amber-400/30">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{currentMovie.rating.toFixed(1)}</span>
              </div>
              <span className="text-white/40">•</span>
              <div className="flex items-center gap-1 text-white/90">
                <Clock className="w-3.5 h-3.5 text-white/70" />
                <span>
                  {Math.floor(currentMovie.durationMinutes / 60)}h {currentMovie.durationMinutes % 60}m
                </span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-white/85 font-medium">{currentMovie.genres.slice(0, 2).join(", ")}</span>
              <span className="text-white/40">•</span>
              <span className="text-white font-semibold bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/20 shadow-sm">
                {currentMovie.languages.join(", ")}
              </span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-white/85 line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl leading-relaxed drop-shadow-sm">
              {currentMovie.synopsis}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href={`/movies/${currentMovie.slug}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm font-bold shadow-lg shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-95 transition-all touch-target"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets</span>
              </Link>

              {hasTrailer && (
                <button
                  type="button"
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-sm font-semibold transition-all active:scale-95 touch-target shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Carousel Slide Controls in normal document flow beneath the media card */}
        {featuredMovies.length > 1 && (
          <div className="mt-4 flex items-center justify-between gap-4 px-2 sm:px-4">
            {/* Pagination Dots Row with Slide Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-white/60">
                {currentIndex + 1} / {featuredMovies.length}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex-shrink-0">
                {featuredMovies.slice(0, Math.min(featuredMovies.length, 6)).map((_, idx) => {
                  const isActive = idx === currentIndex || (currentIndex >= 6 && idx === 5);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? "w-6 bg-[var(--brand-primary)]"
                          : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrow Buttons Aligned Vertically with Dots Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Featured Movie"
                className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/30 backdrop-blur-md transition-all touch-target flex items-center justify-center shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Featured Movie"
                className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/30 backdrop-blur-md transition-all touch-target flex items-center justify-center shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trailer Dialog Modal */}
      <TrailerModal
        trailer={currentMovie.trailer}
        youtubeId={currentMovie.trailer?.key || currentMovie.trailerYoutubeId || currentMovie.trailerKey}
        movieTitle={currentMovie.title}
        trailerName={currentMovie.trailer?.name || currentMovie.trailerName}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />
    </section>
  );
}
