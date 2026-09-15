"use client";

import React, { useEffect, useState } from "react";
import { X, Film, ExternalLink, AlertTriangle } from "lucide-react";
import { MovieTrailer } from "@/types/movie";

interface TrailerModalProps {
  trailer?: MovieTrailer | null;
  youtubeId?: string | null;
  movieTitle: string;
  trailerName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrailerModal({
  trailer,
  youtubeId,
  movieTitle,
  trailerName,
  isOpen,
  onClose,
}: TrailerModalProps) {
  const [showEmbedFallback, setShowEmbedFallback] = useState(false);

  // Derive verified YouTube ID strictly
  const rawId = trailer?.key || youtubeId;
  const cleanYoutubeId =
    rawId && /^[a-zA-Z0-9_-]{6,25}$/.test(rawId.trim())
      ? rawId.trim()
      : null;

  const displayTitle = trailer?.name || trailerName || "Official Trailer";
  const verifiedYoutubeUrl = cleanYoutubeId
    ? `https://www.youtube.com/watch?v=${cleanYoutubeId}`
    : null;

  useEffect(() => {
    if (isOpen) {
      setShowEmbedFallback(false);
    }
  }, [isOpen, cleanYoutubeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${movieTitle} — ${displayTitle}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-black border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with movie title, YouTube direct link, and close button */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] gap-2">
          <h3 className="text-sm font-bold text-white truncate max-w-md">
            {movieTitle} — {displayTitle}
          </h3>

          <div className="flex items-center gap-2 flex-shrink-0">
            {verifiedYoutubeUrl && (
              <a
                href={verifiedYoutubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch on YouTube"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                <span className="hidden sm:inline">Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close trailer"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Video Player or Graceful Fallback States */}
        {cleanYoutubeId ? (
          showEmbedFallback ? (
            <div className="relative aspect-video w-full bg-[var(--bg-surface-elevated)] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">
                This trailer can’t be played inside Showara
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-md leading-relaxed">
                YouTube requires age verification or external playback for this video.
                You can watch this exact official trailer directly on YouTube.
              </p>
              <a
                href={verifiedYoutubeUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/25 active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Watch on YouTube</span>
              </a>
              <button
                type="button"
                onClick={() => setShowEmbedFallback(false)}
                className="mt-3 text-[11px] text-[var(--text-muted)] hover:text-white underline transition-colors"
              >
                Try player again
              </button>
            </div>
          ) : (
            <div>
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${cleanYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${movieTitle} — ${displayTitle}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
              {/* Embed helper toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-surface-elevated)]/80 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                <span>Playback issues or age-restricted?</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmbedFallback(true)}
                    className="text-amber-400 hover:underline font-medium"
                  >
                    Can’t play inside Showara?
                  </button>
                  <span>•</span>
                  <a
                    href={verifiedYoutubeUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[var(--brand-primary)] flex items-center gap-1 font-semibold"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="relative aspect-video w-full bg-[var(--bg-surface-elevated)] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[var(--text-muted)]">
              <Film className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Trailer Unavailable</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm leading-relaxed">
              An official video trailer is not currently available for {movieTitle}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
