"use client";

import React, { useState, useEffect, use, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { showService } from "@/services/showService";
import { movieService } from "@/services/movieService";
import { cinemaService } from "@/services/cinemaService";
import { seatService } from "@/services/seatService";
import { Seat, Show } from "@/types/booking";
import { Movie } from "@/types/movie";
import { Cinema } from "@/types/cinema";
import SeatQuantityModal from "@/components/booking/SeatQuantityModal";
import SeatMap from "@/components/booking/SeatMap";
import {
  Clock,
  ChevronLeft,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";

function SeatSelectionContent({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || "";

  const {
    draft,
    toggleSeat,
    removeSelectedSeats,
    setTargetSeatCount,
    validateAndHoldSeats,
    remainingSeconds,
    initShowSelection,
  } = useBooking();

  const [show, setShow] = useState<Show | null>(draft.show);
  const [movie, setMovie] = useState<Movie | null>(draft.movie);
  const [cinema, setCinema] = useState<Cinema | null>(draft.cinema);
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1 modal: open on initial load only if direct deep-link without active draft
  const [isCountModalOpen, setIsCountModalOpen] = useState<boolean>(() => {
    return !draft.show || draft.show.id !== resolvedParams.showId;
  });

  // Initial show & auditorium loading
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      let activeShow = draft.show;

      if (!activeShow || activeShow.id !== resolvedParams.showId) {
        activeShow = await showService.getShowById(resolvedParams.showId, dateParam);
      }

      if (activeShow) {
        setShow(activeShow);

        // Fetch movie & cinema if missing
        let activeMovie = draft.movie;
        if (!activeMovie || activeMovie.id !== activeShow.movieId) {
          activeMovie = await movieService.getMovieBySlug(activeShow.movieId);
          setMovie(activeMovie);
        }

        let activeCinema = draft.cinema;
        if (!activeCinema || activeCinema.id !== activeShow.cinemaId) {
          activeCinema = await cinemaService.getCinemaBySlug(activeShow.cinemaId);
          setCinema(activeCinema);
        }

        if (activeMovie && activeCinema) {
          initShowSelection(
            activeMovie,
            activeCinema,
            activeShow,
            dateParam || activeShow.date,
            draft.targetSeatCount || 2
          );
        }

        // Fetch seat map for this specific show
        const seats = await seatService.getSeatsForShow(activeShow.id, activeShow.priceConfig);
        setAllSeats(seats);
      }

      setLoading(false);
    }

    loadData();
  }, [resolvedParams.showId, dateParam]);

  // Live real-time seat availability polling every 15 seconds
  useEffect(() => {
    if (!show) return;

    const pollInterval = setInterval(async () => {
      try {
        const freshSeats = await seatService.getSeatsForShow(show.id, show.priceConfig);
        setAllSeats(freshSeats);

        // Check if any currently selected seat was taken by another user
        const freshUnavailable = new Set(
          freshSeats
            .filter((s) => s.status === "OCCUPIED" || s.status === "LOCKED")
            .map((s) => s.id)
        );

        const contested = draft.selectedSeats.filter((s) => freshUnavailable.has(s.id));
        if (contested.length > 0) {
          const contestedIds = contested.map((s) => s.id);
          removeSelectedSeats(contestedIds);
          setErrorMessage(
            `Seat ${contestedIds.join(", ")} is no longer available. Please select another seat.`
          );
        }
      } catch (err) {
        console.warn("Seat status poll error:", err);
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [show, draft.selectedSeats, removeSelectedSeats]);

  // Handle count confirmation from Step 1 modal
  const handleConfirmCount = useCallback(
    (count: number) => {
      setTargetSeatCount(count);
      setIsCountModalOpen(false);
    },
    [setTargetSeatCount]
  );

  // Handle toggling seat with automatic error clearing on valid replacement selection
  const handleToggleSeat = useCallback(
    (seat: Seat) => {
      const res = toggleSeat(seat);
      if (res.added) {
        setErrorMessage(null);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
      return res;
    },
    [toggleSeat]
  );

  // Handle Proceed CTA with server-side double-booking re-validation
  const handleProceed = async () => {
    if (!show || isProcessing) return;

    if (draft.selectedSeats.length === 0) {
      setErrorMessage("Please select your seats to proceed.");
      return;
    }

    if (draft.selectedSeats.length !== draft.targetSeatCount) {
      setErrorMessage(
        `Please select exactly ${draft.targetSeatCount} seat${draft.targetSeatCount > 1 ? "s" : ""} to proceed.`
      );
      return;
    }

    if (remainingSeconds <= 0 && draft.seatHoldExpiry) {
      setErrorMessage("Your seat reservation has expired. Please select your seats again.");
      return;
    }

    // Check if any selected seat is already known to be unavailable
    const seatMap = new Map(allSeats.map((s) => [s.id, s]));
    const invalidSelected = draft.selectedSeats.filter((s) => {
      const current = seatMap.get(s.id);
      return !current || current.status === "OCCUPIED" || current.status === "LOCKED";
    });

    if (invalidSelected.length > 0) {
      const invalidIds = invalidSelected.map((s) => s.id);
      removeSelectedSeats(invalidIds);
      setErrorMessage(
        `Seat ${invalidIds.join(", ")} is no longer available. Please select another seat.`
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Re-check seat availability server-side before proceeding to prevent race conditions
      const selectedIds = draft.selectedSeats.map((s) => s.id);
      const validationRes = await validateAndHoldSeats(show.id, selectedIds);

      if (!validationRes.success) {
        // Refresh local seats to reflect taken seats
        const freshSeats = await seatService.getSeatsForShow(show.id, show.priceConfig);
        setAllSeats(freshSeats);

        // Identify unavailable seats from response or fresh seats
        const unavailable =
          validationRes.unavailableSeats && validationRes.unavailableSeats.length > 0
            ? validationRes.unavailableSeats
            : selectedIds.filter((id) => {
                const s = freshSeats.find((fs) => fs.id === id);
                return !s || s.status === "OCCUPIED" || s.status === "LOCKED";
              });

        const fallbackIds = unavailable.length > 0 ? unavailable : selectedIds;

        // Immediately remove invalid seat(s) from state so UI and counters update
        removeSelectedSeats(fallbackIds);

        setErrorMessage(
          validationRes.error ||
            `Seat ${fallbackIds.join(", ")} is no longer available. Please select another seat.`
        );
        setIsProcessing(false);
        return;
      }

      // Validated and locked successfully — proceed to booking review
      router.push("/booking/review");
    } catch (err) {
      setErrorMessage("Unable to verify seat availability. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format countdown mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-main)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Loading auditorium seat layout...
          </p>
        </div>
      </div>
    );
  }

  if (!show || !movie || !cinema) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-main)]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Showtime Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          This show schedule is invalid or expired.
        </p>
        <Link
          href="/movies"
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Return to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-32 pb-safe">
      {/* Top Showtime Info Header */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] py-3 px-4 sm:px-6 lg:px-8 pl-safe pr-safe pt-safe shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] touch-target"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {movie.title}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] uppercase">
                  {movie.certification}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--brand-primary)] text-white">
                  {show.format}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {cinema.name} • {show.screenName} • {show.startTime}, {show.date}
              </p>
            </div>
          </div>

          {/* Seat Hold Countdown Timer */}
          {remainingSeconds > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold animate-pulse self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5" />
              <span>Seats reserved for: {formatTimer(remainingSeconds)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container: Seat Map & Flow */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pl-safe pr-safe pt-6">
        {/* Error / Race Condition Notification Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 2: Interactive Seat Map */}
        <SeatMap
          show={show}
          allSeats={allSeats}
          selectedSeats={draft.selectedSeats}
          targetSeatCount={draft.targetSeatCount || 2}
          pricing={draft.pricing}
          onToggleSeat={handleToggleSeat}
          onProceed={handleProceed}
          onChangeCount={() => setIsCountModalOpen(true)}
          isProcessing={isProcessing}
          isExpired={remainingSeconds <= 0 && !!draft.seatHoldExpiry}
        />
      </main>

      {/* Step 1: "How many seats?" Modal */}
      <SeatQuantityModal
        isOpen={isCountModalOpen}
        initialCount={draft.targetSeatCount || 2}
        show={show}
        movie={movie}
        cinema={cinema}
        allSeats={allSeats}
        onConfirm={handleConfirmCount}
        onClose={() => setIsCountModalOpen(false)}
      />
    </div>
  );
}

export default function SeatSelectionPage(props: { params: Promise<{ showId: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)]" />}>
      <SeatSelectionContent {...props} />
    </Suspense>
  );
}
