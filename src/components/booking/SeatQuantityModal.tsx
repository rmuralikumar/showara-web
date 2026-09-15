"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Seat, SeatTier, Show } from "@/types/booking";
import { Movie } from "@/types/movie";
import { Cinema } from "@/types/cinema";
import { seatService } from "@/services/seatService";
import {
  Sparkles,
  X,
  ChevronRight,
  AlertCircle,
  Film,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

export interface SeatQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  show: Show | null;
  movie?: Movie | null;
  cinema?: Cinema | null;
  allSeats?: Seat[];
  initialCount?: number;
}

const TIER_META: Record<string, { label: string; description: string }> = {
  RECLINER: { label: "VIP Recliner", description: "Plush leather recliners with extra legroom" },
  PRIME: { label: "Prime Executive", description: "Premium center view rows with ergonomic seating" },
  CLASSIC: { label: "Classic Club", description: "Standard comfortable cinema seats" },
};

export default function SeatQuantityModal({
  isOpen,
  onClose,
  onConfirm,
  show,
  movie,
  cinema,
  allSeats: providedSeats,
  initialCount = 2,
}: SeatQuantityModalProps) {
  const maxLimit = Math.min(10, show?.maxSeatsPerBooking || 10);
  const [selectedCount, setSelectedCount] = useState<number>(() =>
    Math.max(1, Math.min(maxLimit, initialCount))
  );
  const [loadedSeats, setLoadedSeats] = useState<Seat[]>(providedSeats || []);
  const [showBestsellerBanner, setShowBestsellerBanner] = useState<boolean>(true);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Sync selected count when initialCount or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setSelectedCount(Math.max(1, Math.min(maxLimit, initialCount)));
      setShowBestsellerBanner(true);
    }
  }, [isOpen, initialCount, maxLimit]);

  // Load seats dynamically if not provided as props
  useEffect(() => {
    if (!isOpen || !show) return;

    if (providedSeats && providedSeats.length > 0) {
      setLoadedSeats(providedSeats);
      return;
    }

    let isMounted = true;
    seatService.getSeatsForShow(show.id, show.priceConfig).then((seats) => {
      if (isMounted) {
        setLoadedSeats(seats);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, show, providedSeats]);

  // Scroll lock on body
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Accessibility: Focus trap & restore focus on close
  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Shift focus into modal
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Accessibility: Handle Escape key & Tab focus trapping
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Total available seats across all tiers
  const totalAvailableSeats = useMemo(() => {
    return loadedSeats.filter((s) => s.status === "AVAILABLE" || s.status === "WHEELCHAIR").length;
  }, [loadedSeats]);

  // Dynamic price-tier table calculations from THIS show's specific pricing and live seat counts
  const tierSummaries = useMemo(() => {
    if (!show?.priceConfig) return [];

    const tierKeys = Object.keys(show.priceConfig) as SeatTier[];
    const orderedTiers = ["RECLINER", "PRIME", "CLASSIC"].filter((t) =>
      tierKeys.includes(t as SeatTier)
    ) as SeatTier[];
    const remainingKeys = tierKeys.filter((t) => !orderedTiers.includes(t));
    const allTiers = [...orderedTiers, ...remainingKeys];

    return allTiers.map((tier) => {
      const price = show.priceConfig[tier] || 0;
      const tierSeats = loadedSeats.filter((s) => s.tier === tier);
      const freeCount = tierSeats.filter(
        (s) => s.status === "AVAILABLE" || s.status === "WHEELCHAIR"
      ).length;

      let statusText = "Available";
      let statusColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

      if (tierSeats.length > 0 && freeCount === 0) {
        statusText = "Sold out";
        statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/30";
      } else if (tierSeats.length > 0 && freeCount < selectedCount) {
        statusText = `Almost Full (${freeCount} left)`;
        statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/30";
      } else if (tierSeats.length > 0 && freeCount <= Math.max(selectedCount * 2, 6)) {
        statusText = "Filling fast";
        statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/30";
      }

      return {
        tier,
        label: TIER_META[tier]?.label || `${tier} Class`,
        price,
        freeCount,
        totalCount: tierSeats.length,
        statusText,
        statusColor,
      };
    });
  }, [show?.priceConfig, loadedSeats, selectedCount]);

  if (!isOpen || !show) return null;

  const isOverCapacity = loadedSeats.length > 0 && selectedCount > totalAvailableSeats;
  const bestsellerTier = show.bestsellerTier;
  const bestsellerLabel = bestsellerTier ? TIER_META[bestsellerTier]?.label || `${bestsellerTier} Seats` : null;

  const handleSelectCount = (num: number) => {
    setSelectedCount(num);
  };

  const handleConfirm = () => {
    if (isOverCapacity) return;
    onConfirm(selectedCount);
  };

  // Build dynamic subtitle from real auditorium + format data
  const dynamicSubtitle = `${show.screenName} • ${show.format}`;

  // CTA text with accurate singular / plural
  const ctaText =
    selectedCount === 1 ? "Select 1 Seat" : `Select ${selectedCount} Seats`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seat-count-modal-title"
      aria-describedby="seat-quantity-subtitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[560px] bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] max-sm:fixed max-sm:bottom-0 max-sm:inset-x-0 max-sm:rounded-t-3xl max-sm:rounded-b-none sm:rounded-3xl transition-all duration-200"
      >
        {/* 1. STICKY / FIXED HEADER */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface)] shrink-0">
          <div className="pr-4">
            <h2
              id="seat-count-modal-title"
              className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight"
            >
              How many seats?
            </h2>
            <p
              id="seat-quantity-subtitle"
              className="text-xs text-[var(--text-muted)] mt-0.5 font-medium truncate max-w-[320px] sm:max-w-[420px]"
            >
              {dynamicSubtitle}
            </p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors touch-target focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SCROLLABLE BODY */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Ticket / Movie-Type Info Card */}
          <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Film className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                  <span className="font-bold text-sm text-[var(--text-primary)] tracking-tight">
                    {movie?.title || "Selected Movie"}
                  </span>
                  {movie?.certification && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {movie.certification}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap pt-0.5">
                  <span className="font-semibold text-[var(--brand-primary)]">
                    {show.format}
                  </span>
                  <span>•</span>
                  <span>{show.language}</span>
                  {cinema?.name && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[160px] sm:max-w-[200px]">{cinema.name}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-primary)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{show.startTime}</span>
                </div>
                {show.date && (
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{show.date}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Number of Seats Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                Number of Seats
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Max {maxLimit} seats per booking
              </span>
            </div>

            {/* Horizontal Quantity Options 1–10 */}
            <div
              role="radiogroup"
              aria-label="Quantity options"
              className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] overflow-x-auto no-scrollbar"
            >
              {Array.from({ length: maxLimit }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${num} seat${num > 1 ? "s" : ""}`}
                    onClick={() => handleSelectCount(num)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectCount(num);
                      }
                    }}
                    className={`flex-1 min-w-[36px] h-10 rounded-full text-xs font-black transition-all duration-150 flex items-center justify-center touch-target focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${
                      isSelected
                        ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary-glow)] scale-105 ring-2 ring-[var(--brand-primary)] ring-offset-2 ring-offset-white dark:ring-offset-[var(--bg-surface)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Price Tier Summary List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                Auditorium Tier Pricing
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Per seat</span>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] shadow-xs">
              {tierSummaries.map((tier) => (
                <div
                  key={tier.tier}
                  className="flex items-center justify-between p-3.5 text-xs hover:bg-[var(--bg-main)] transition-colors"
                >
                  <div>
                    <div className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">
                      {tier.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {tier.totalCount > 0
                        ? `${tier.freeCount} of ${tier.totalCount} seats available`
                        : "Pricing available"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-[var(--text-primary)] text-sm sm:text-base">
                      ₹{tier.price}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${tier.statusColor}`}
                    >
                      {tier.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bestseller Banner (rendered ONLY if show.bestsellerTier exists in data) */}
          {showBestsellerBanner && bestsellerLabel && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs animate-fade-in">
              <div className="flex items-start gap-2.5 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 fill-amber-500/30" />
                <div>
                  <span className="font-bold text-xs text-amber-800 dark:text-amber-200">
                    Book the {bestsellerLabel} Bestseller Seats in this cinema at no extra cost!
                  </span>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Highest-rated viewing angles with premium sound immersion.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBestsellerBanner(false)}
                aria-label="Dismiss banner"
                className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Capacity warning if selected count exceeds available auditorium seats */}
          {isOverCapacity && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>
                {totalAvailableSeats === 0
                  ? "This show is sold out. No seats available."
                  : `Only ${totalAvailableSeats} seat${totalAvailableSeats === 1 ? "" : "s"} available for this show. Please select a smaller quantity.`}
              </span>
            </div>
          )}
        </div>

        {/* 3. STICKY BOTTOM CTA */}
        <div className="sticky bottom-0 z-20 p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-surface)] shrink-0">
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isOverCapacity}
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm font-black shadow-lg shadow-[var(--brand-primary-glow)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99] transition-all touch-target flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
          >
            <span>{isOverCapacity ? "Capacity Exceeded" : ctaText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
