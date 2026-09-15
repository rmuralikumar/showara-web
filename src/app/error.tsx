"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, Film } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log non-sensitive error notice
    console.warn("Application runtime error caught by boundary:", error.message);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-main)]">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5 text-rose-500">
        <AlertCircle className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">
        Playback Interruption
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
        Something Went Wrong
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-md leading-relaxed">
        An unexpected issue occurred while rendering this cinema view. You can retry loading or return to the movie catalog.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-xs font-bold shadow-md shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <Link
          href="/movies"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] text-xs font-bold transition-all"
        >
          <Film className="w-4 h-4" />
          <span>Browse Movies</span>
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
