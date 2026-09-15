"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Seat, SeatTier, Show, BookingFeeBreakdown } from "@/types/booking";
import {
  Sparkles,
  Accessibility,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  AlertCircle,
  X,
  CreditCard,
  Edit3,
  Armchair,
} from "lucide-react";

interface SeatMapProps {
  show: Show;
  allSeats: Seat[];
  selectedSeats: Seat[];
  targetSeatCount: number;
  pricing: BookingFeeBreakdown;
  onToggleSeat: (seat: Seat) => { added: boolean; error?: string };
  onProceed: () => void;
  onChangeCount: () => void;
  isProcessing?: boolean;
}

const TIER_ORDER: SeatTier[] = ["RECLINER", "PRIME", "CLASSIC"];

const TIER_META: Record<SeatTier, { label: string; rows: string[] }> = {
  RECLINER: { label: "VIP Recliner", rows: ["A"] },
  PRIME: { label: "Prime Executive", rows: ["B", "C", "D"] },
  CLASSIC: { label: "Classic Club", rows: ["E", "F", "G", "H"] },
};

export default function SeatMap({
  show,
  allSeats,
  selectedSeats,
  targetSeatCount,
  pricing,
  onToggleSeat,
  onProceed,
  onChangeCount,
  isProcessing = false,
}: SeatMapProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Group seats by tier and row
  const tierSections = useMemo(() => {
    return TIER_ORDER.filter((tier) => show.priceConfig[tier] !== undefined).map((tier) => {
      const meta = TIER_META[tier] || { label: `${tier} rows`, rows: [] };
      const price = show.priceConfig[tier] || 0;
      const tierSeats = allSeats.filter((s) => s.tier === tier);

      // Unique rows in this tier
      const rows = Array.from(new Set(tierSeats.map((s) => s.row))).sort();

      return {
        tier,
        label: meta.label,
        price,
        rows,
        seats: tierSeats,
      };
    });
  }, [show.priceConfig, allSeats]);

  // Handle seat clicks with strict count enforcement
  const handleSeatClick = useCallback(
    (seat: Seat) => {
      setSelectionNotice(null);

      if (seat.status === "OCCUPIED" || seat.status === "LOCKED") {
        return;
      }

      const isAlreadySelected = selectedSeats.some((s) => s.id === seat.id);

      if (!isAlreadySelected && selectedSeats.length >= targetSeatCount) {
        setSelectionNotice(
          `You chose ${targetSeatCount} seat${targetSeatCount > 1 ? "s" : ""}. Please tap a selected seat to deselect it first, or click "Change count".`
        );
        return;
      }

      const res = onToggleSeat(seat);
      if (res.error) {
        setSelectionNotice(res.error);
      }
    },
    [selectedSeats, targetSeatCount, onToggleSeat]
  );

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.5, Math.round((prev + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.75, Math.round((prev - 0.15) * 100) / 100));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Keyboard navigation handler for seat grid
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target || !target.dataset.seatId) return;

    const currentSeatId = target.dataset.seatId;
    const currentSeat = allSeats.find((s) => s.id === currentSeatId);
    if (!currentSeat) return;

    let nextTargetId: string | null = null;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const sameRow = allSeats
        .filter((s) => s.row === currentSeat.row)
        .sort((a, b) => a.number - b.number);
      const idx = sameRow.findIndex((s) => s.id === currentSeatId);
      if (idx >= 0 && idx < sameRow.length - 1) {
        nextTargetId = sameRow[idx + 1].id;
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const sameRow = allSeats
        .filter((s) => s.row === currentSeat.row)
        .sort((a, b) => a.number - b.number);
      const idx = sameRow.findIndex((s) => s.id === currentSeatId);
      if (idx > 0) {
        nextTargetId = sameRow[idx - 1].id;
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const allRows = Array.from(new Set(allSeats.map((s) => s.row))).sort();
      const rowIdx = allRows.indexOf(currentSeat.row);
      if (rowIdx >= 0 && rowIdx < allRows.length - 1) {
        const nextRow = allRows[rowIdx + 1];
        const nextRowSeats = allSeats.filter((s) => s.row === nextRow);
        // Find seat with closest number
        const closest = nextRowSeats.reduce((prev, curr) =>
          Math.abs(curr.number - currentSeat.number) < Math.abs(prev.number - currentSeat.number)
            ? curr
            : prev
        );
        if (closest) nextTargetId = closest.id;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const allRows = Array.from(new Set(allSeats.map((s) => s.row))).sort();
      const rowIdx = allRows.indexOf(currentSeat.row);
      if (rowIdx > 0) {
        const prevRow = allRows[rowIdx - 1];
        const prevRowSeats = allSeats.filter((s) => s.row === prevRow);
        const closest = prevRowSeats.reduce((prev, curr) =>
          Math.abs(curr.number - currentSeat.number) < Math.abs(prev.number - currentSeat.number)
            ? curr
            : prev
        );
        if (closest) nextTargetId = closest.id;
      }
    }

    if (nextTargetId) {
      const btn = gridContainerRef.current?.querySelector<HTMLButtonElement>(
        `[data-seat-id="${nextTargetId}"]`
      );
      btn?.focus();
    }
  };

  const isExactCountSelected = selectedSeats.length === targetSeatCount;
  const remainingNeeded = targetSeatCount - selectedSeats.length;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls Toolbar: Count Pill + Zoom Toolbar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-6 px-2">
        {/* Seat Count Status & Change Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)]">Seats required:</span>
            <span className="font-black text-[var(--brand-primary)] text-sm">
              {targetSeatCount}
            </span>
            <span className="text-[var(--text-secondary)]">
              ({selectedSeats.length}/{targetSeatCount} selected)
            </span>
          </div>

          <button
            type="button"
            onClick={onChangeCount}
            aria-label="Edit number of seats"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 text-xs font-bold transition-colors touch-target"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        </div>

        {/* Zoom Controls with Clear Aria Labels */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-sm">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.75}
            aria-label="Zoom out"
            title="Zoom out"
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            aria-label="Reset zoom"
            title="Reset to 100%"
            className="px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-lg transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 1.5}
            aria-label="Zoom in"
            title="Zoom in"
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-target"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Selection Warning / Prompt Banner */}
      {selectionNotice && (
        <div
          role="alert"
          className="w-full max-w-4xl mb-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-medium flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{selectionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectionNotice(null)}
            aria-label="Dismiss notice"
            className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen Direction Curved Indicator */}
      <div className="w-full max-w-2xl text-center mb-8">
        <div className="h-2.5 w-full bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent cinema-screen-curve opacity-90 shadow-md shadow-[var(--brand-primary-glow)]" />
        <p className="text-[11px] uppercase font-black tracking-widest text-[var(--text-muted)] mt-2.5 flex items-center justify-center gap-2">
          <span>All Eyes This Way — Cinema Screen</span>
        </p>
      </div>

      {/* Zoomable Seat Grid Container */}
      <div
        ref={gridContainerRef}
        onKeyDown={handleGridKeyDown}
        className="w-full overflow-x-auto py-4 px-3 select-none"
      >
        <div
          style={{
            zoom: zoom,
            minWidth: "560px",
          }}
          className="w-fit max-w-3xl mx-auto space-y-9"
        >
          {tierSections.map((section) => (
            <div key={section.tier} className="space-y-3.5">
              {/* Tier Section Header matching Step 1 */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 px-1">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {section.label}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{section.price}
                </span>
              </div>

              {/* Rows inside this tier */}
              <div className="space-y-2">
                {section.rows.map((rowName) => {
                  const rowSeats = section.seats
                    .filter((s) => s.row === rowName)
                    .sort((a, b) => a.number - b.number);

                  return (
                    <div key={rowName} className="flex items-center justify-center gap-2.5">
                      {/* Row Letter Identifier */}
                      <span className="w-5 text-xs font-black text-[var(--text-muted)] text-center">
                        {rowName}
                      </span>

                      {/* Row Seats */}
                      <div className="flex items-center gap-1.5">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeats.some((s) => s.id === seat.id);
                          const isOccupied = seat.status === "OCCUPIED" || seat.status === "LOCKED";
                          const isWheelchair =
                            seat.status === "WHEELCHAIR" ||
                            (seat.row === "H" && (seat.number === 1 || seat.number === 16));

                          // State Styling with Accessible Cues
                          let buttonStyle =
                            "bg-[var(--seat-available)] border-[var(--seat-available-border)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:scale-105 shadow-sm";
                          let labelState = "available";

                          if (isOccupied) {
                            buttonStyle =
                              "bg-[var(--seat-occupied)] border-transparent text-[var(--seat-occupied-text)] cursor-not-allowed opacity-40 line-through";
                            labelState = "unavailable";
                          } else if (isSelected) {
                            buttonStyle =
                              "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white font-black shadow-lg shadow-[var(--brand-primary-glow)] scale-110 ring-2 ring-white/20";
                            labelState = "selected";
                          } else if (isWheelchair) {
                            buttonStyle =
                              "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 hover:border-emerald-500";
                            labelState = "wheelchair accessible, available";
                          }

                          const ariaLabel = `Row ${seat.row}, seat ${seat.number}, ${section.label}, ₹${seat.price}, ${labelState}`;

                          return (
                            <React.Fragment key={seat.id}>
                              <button
                                type="button"
                                data-seat-id={seat.id}
                                disabled={isOccupied}
                                onClick={() => handleSeatClick(seat)}
                                title={`Seat ${seat.id} (${section.label}) - ₹${seat.price}`}
                                aria-label={ariaLabel}
                                aria-pressed={isSelected}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[10px] font-bold transition-transform flex items-center justify-center touch-target ${buttonStyle}`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : isWheelchair ? (
                                  <Accessibility className="w-4 h-4" />
                                ) : (
                                  seat.number
                                )}
                              </button>

                              {/* Aisle Spacing */}
                              {seat.isAisleRight && (
                                <span className="w-3 sm:w-5" aria-hidden="true" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seat States Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-5 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--seat-available)] border border-[var(--seat-available-border)]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--brand-primary)] text-white flex items-center justify-center text-[10px] font-black">
            ✓
          </div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[var(--seat-occupied)] border border-[var(--border-subtle)] opacity-40 flex items-center justify-center text-[10px] text-gray-400">
            ✕
          </div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-500">
            <Accessibility className="w-3 h-3" />
          </div>
          <span>Wheelchair Accessible</span>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile & Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-6 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Selected Seat Tags & Subtotal */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {selectedSeats.length > 0 ? (
                    <>
                      Seats:{" "}
                      <strong className="text-[var(--text-primary)]">
                        {selectedSeats.map((s) => s.id).join(", ")}
                      </strong>
                    </>
                  ) : (
                    "No seats chosen"
                  )}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-bold text-[var(--brand-primary)]">
                  {selectedSeats.length} of {targetSeatCount} selected
                </span>
              </div>

              <div className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-0.5">
                ₹{pricing.totalAmount}
                <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1.5">
                  (incl. tickets, convenience fee & tax)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Proceed CTA - Strictly Enabled ONLY when exact count is reached */}
          <button
            type="button"
            disabled={!isExactCountSelected || isProcessing}
            onClick={onProceed}
            className="w-full sm:w-auto min-w-[240px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm font-black shadow-lg shadow-[var(--brand-primary-glow)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-98 transition-all touch-target flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : !isExactCountSelected ? (
              <span>
                {remainingNeeded > 0
                  ? `Select ${remainingNeeded} more seat${remainingNeeded > 1 ? "s" : ""}`
                  : `Deselect ${selectedSeats.length - targetSeatCount} seat(s)`}
              </span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Pay (₹{pricing.totalAmount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
