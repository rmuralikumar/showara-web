import React from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { Movie } from "@/types/movie";
import { Star, Ticket, Clock, Calendar } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

export default function MovieCard({ movie, priority = false }: MovieCardProps) {
  const isUpcoming = movie.status === "upcoming";

  return (
    <div className="group relative flex flex-col bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--border-strong)] hover:shadow-xl transition-all duration-300">
      {/* Poster Container */}
      <Link
        href={`/movies/${movie.slug}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--bg-surface-elevated)] block"
      >
        <SafeImage
          src={movie.posterUrl || movie.posterPath}
          alt={movie.title}
          type="poster"
          fallbackTitle={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={priority}
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Rating or Release Date Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
          {isUpcoming ? (
            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(movie.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </span>
          ) : (
            <>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
              <span className="text-[9px] text-[var(--text-muted)] font-normal uppercase hidden sm:inline">
                TMDB
              </span>
            </>
          )}
        </div>

        {/* Certification Badge */}
        <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
          {movie.certification}
        </div>

        {/* Formats banner at bottom of poster */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
          {movie.formats.slice(0, 2).map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--brand-primary)]/85 backdrop-blur-sm text-white shadow-sm"
            >
              {fmt}
            </span>
          ))}
          {movie.formats.length > 2 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
              +{movie.formats.length - 2}
            </span>
          )}
        </div>
      </Link>

      {/* Movie Details Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/movies/${movie.slug}`}>
            <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>

          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
            {movie.genres.join(" • ")}
          </p>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-[var(--text-secondary)]">
            <span className="truncate max-w-[120px]">{movie.languages.join(", ")}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
              {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)]">
          <Link
            href={`/movies/${movie.slug}`}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all touch-target ${
              isUpcoming
                ? "bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)]"
                : "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-md shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-[0.98]"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isUpcoming ? "View Details" : "Book Tickets"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
