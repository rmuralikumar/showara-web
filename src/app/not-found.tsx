import React from "react";
import Link from "next/link";
import { Film, Home, Clapperboard, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-main)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 text-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary-glow)]">
        <Film className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-1">
        Error 404
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
        Scene Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-md leading-relaxed">
        The cinematic title, cinema, or booking screen you requested could not be located in our active schedule.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/movies"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-xs font-bold shadow-md shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Clapperboard className="w-4 h-4" />
          <span>Explore Movies</span>
        </Link>

        <Link
          href="/cinemas"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] text-xs font-bold transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Find Cinemas</span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
