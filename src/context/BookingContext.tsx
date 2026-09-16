"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BookingFeeBreakdown, Seat, Show } from "@/types/booking";
import { Movie } from "@/types/movie";
import { Cinema } from "@/types/cinema";
import { bookingService } from "@/services/bookingService";
import { seatService } from "@/services/seatService";

interface BookingDraft {
  movie: Movie | null;
  cinema: Cinema | null;
  show: Show | null;
  date: string;
  targetSeatCount: number;
  selectedSeats: Seat[];
  seatHoldExpiry: number | null;
  discountCode: string;
  pricing: BookingFeeBreakdown;
}

interface BookingContextType {
  draft: BookingDraft;
  initShowSelection: (movie: Movie, cinema: Cinema, show: Show, date: string, targetCount?: number) => void;
  setTargetSeatCount: (count: number) => void;
  toggleSeat: (seat: Seat, maxLimit?: number) => { added: boolean; error?: string };
  removeSelectedSeats: (seatIds: string[]) => void;
  validateAndHoldSeats: (showId: string, seatIds: string[]) => Promise<{ success: boolean; unavailableSeats?: string[]; error?: string }>;
  applyDiscountCode: (code: string) => void;
  clearBooking: () => void;
  remainingSeconds: number;
}

const INITIAL_PRICING: BookingFeeBreakdown = {
  ticketSubtotal: 0,
  convenienceFeePerTicket: 35,
  totalConvenienceFee: 0,
  taxGst: 0,
  discount: 0,
  totalAmount: 0,
};

const INITIAL_DRAFT: BookingDraft = {
  movie: null,
  cinema: null,
  show: null,
  date: "",
  targetSeatCount: 2,
  selectedSeats: [],
  seatHoldExpiry: null,
  discountCode: "",
  pricing: INITIAL_PRICING,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(INITIAL_DRAFT);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Restore draft from sessionStorage if present
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("showara_active_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.seatHoldExpiry && parsed.seatHoldExpiry > Date.now()) {
          setDraft(parsed);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // Timer countdown for held seats
  useEffect(() => {
    if (!draft.seatHoldExpiry) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const left = Math.max(0, Math.floor((draft.seatHoldExpiry! - Date.now()) / 1000));
      setRemainingSeconds(left);

      if (left <= 0 && draft.selectedSeats.length > 0) {
        // Expired! Release seats
        if (draft.show) {
          seatService.unlockSeats(draft.show.id);
        }
        setDraft((prev) => ({
          ...prev,
          selectedSeats: [],
          seatHoldExpiry: null,
          pricing: INITIAL_PRICING,
        }));
        sessionStorage.removeItem("showara_active_draft");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [draft.seatHoldExpiry, draft.selectedSeats.length, draft.show]);

  const initShowSelection = (
    movie: Movie,
    cinema: Cinema,
    show: Show,
    date: string,
    targetCount: number = 2
  ) => {
    const updated: BookingDraft = {
      movie,
      cinema,
      show,
      date,
      targetSeatCount: targetCount,
      selectedSeats: [],
      seatHoldExpiry: null,
      discountCode: "",
      pricing: INITIAL_PRICING,
    };
    setDraft(updated);
    sessionStorage.setItem("showara_active_draft", JSON.stringify(updated));
  };

  const setTargetSeatCount = (count: number) => {
    const sanitizedCount = Math.max(1, Math.min(10, count));
    let updatedSeats = draft.selectedSeats;

    // If existing selected seats exceed the new target, trim excess
    if (updatedSeats.length > sanitizedCount) {
      updatedSeats = updatedSeats.slice(0, sanitizedCount);
    }

    const newPricing = bookingService.calculatePricing(updatedSeats, draft.discountCode);
    const updatedDraft: BookingDraft = {
      ...draft,
      targetSeatCount: sanitizedCount,
      selectedSeats: updatedSeats,
      pricing: newPricing,
    };

    setDraft(updatedDraft);
    sessionStorage.setItem("showara_active_draft", JSON.stringify(updatedDraft));
  };

  const toggleSeat = (seat: Seat, maxLimit?: number): { added: boolean; error?: string } => {
    if (seat.status === "OCCUPIED" || seat.status === "LOCKED") {
      return {
        added: false,
        error: `Seat ${seat.id} is no longer available. Please select another seat.`,
      };
    }

    const limit = maxLimit ?? draft.targetSeatCount ?? 2;
    const exists = draft.selectedSeats.some((s) => s.id === seat.id);

    if (exists) {
      const filtered = draft.selectedSeats.filter((s) => s.id !== seat.id);
      const newPricing = bookingService.calculatePricing(filtered, draft.discountCode);
      const expiry = filtered.length > 0 ? draft.seatHoldExpiry : null;

      const updated = {
        ...draft,
        selectedSeats: filtered,
        seatHoldExpiry: expiry,
        pricing: newPricing,
      };

      setDraft(updated);
      sessionStorage.setItem("showara_active_draft", JSON.stringify(updated));
      return { added: false };
    }

    // Limit check: Cannot select more than the target seat count
    if (draft.selectedSeats.length >= limit) {
      return {
        added: false,
        error: `You have selected your ${limit} seat${limit > 1 ? "s" : ""}. Deselect a seat to pick another, or edit your seat count.`,
      };
    }

    const updatedSeats = [...draft.selectedSeats, { ...seat, status: "SELECTED" as const }];
    const newPricing = bookingService.calculatePricing(updatedSeats, draft.discountCode);

    // Initialize or keep seat hold expiry
    let holdExpiry = draft.seatHoldExpiry;
    if (!holdExpiry || holdExpiry < Date.now()) {
      if (draft.show) {
        const lockRes = seatService.lockSeats(
          draft.show.id,
          updatedSeats.map((s) => s.id)
        );
        holdExpiry = lockRes.expiresAt;
      }
    }

    const updatedDraft: BookingDraft = {
      ...draft,
      selectedSeats: updatedSeats,
      seatHoldExpiry: holdExpiry,
      pricing: newPricing,
    };

    setDraft(updatedDraft);
    sessionStorage.setItem("showara_active_draft", JSON.stringify(updatedDraft));
    return { added: true };
  };

  const removeSelectedSeats = (seatIds: string[]) => {
    if (!seatIds || seatIds.length === 0) return;
    const seatIdSet = new Set(seatIds);
    setDraft((prev) => {
      const filtered = prev.selectedSeats.filter((s) => !seatIdSet.has(s.id));
      if (filtered.length === prev.selectedSeats.length) return prev;
      const newPricing = bookingService.calculatePricing(filtered, prev.discountCode);
      const expiry = filtered.length > 0 ? prev.seatHoldExpiry : null;
      const updated: BookingDraft = {
        ...prev,
        selectedSeats: filtered,
        seatHoldExpiry: expiry,
        pricing: newPricing,
      };
      try {
        sessionStorage.setItem("showara_active_draft", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const validateAndHoldSeats = async (
    showId: string,
    seatIds: string[]
  ): Promise<{ success: boolean; unavailableSeats?: string[]; error?: string }> => {
    if (!draft.show) {
      return { success: false, error: "No active show selected." };
    }

    const res = await seatService.validateAndLockSeats(showId, seatIds, draft.show.priceConfig);
    if (res.success && res.expiresAt) {
      const updatedDraft: BookingDraft = {
        ...draft,
        seatHoldExpiry: res.expiresAt,
      };
      setDraft(updatedDraft);
      sessionStorage.setItem("showara_active_draft", JSON.stringify(updatedDraft));
    }
    return res;
  };

  const applyDiscountCode = (code: string) => {
    const newPricing = bookingService.calculatePricing(draft.selectedSeats, code);
    const updated = {
      ...draft,
      discountCode: code,
      pricing: newPricing,
    };
    setDraft(updated);
    sessionStorage.setItem("showara_active_draft", JSON.stringify(updated));
  };

  const clearBooking = () => {
    if (draft.show) {
      seatService.unlockSeats(draft.show.id);
    }
    setDraft(INITIAL_DRAFT);
    sessionStorage.removeItem("showara_active_draft");
  };

  return (
    <BookingContext.Provider
      value={{
        draft,
        initShowSelection,
        setTargetSeatCount,
        toggleSeat,
        removeSelectedSeats,
        validateAndHoldSeats,
        applyDiscountCode,
        clearBooking,
        remainingSeconds,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
