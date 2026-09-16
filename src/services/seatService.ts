import { generateSeatMapForShow } from "@/data/seats";
import { Seat, ShowPriceConfig } from "@/types/booking";

const SEAT_LOCK_STORAGE_KEY = "showara_active_seat_locks";
const HOLD_MINUTES = 8;

interface ActiveSeatLock {
  showId: string;
  seatIds: string[];
  expiresAt: number; // timestamp ms
}

export const seatService = {
  getSeatsForShow: async (showId: string, priceConfig: ShowPriceConfig): Promise<Seat[]> => {
    const defaultSeats = generateSeatMapForShow(showId, priceConfig);

    if (typeof window === "undefined") return defaultSeats;

    try {
      const stored = localStorage.getItem(SEAT_LOCK_STORAGE_KEY);
      if (!stored) return defaultSeats;

      const locks: ActiveSeatLock[] = JSON.parse(stored);
      const now = Date.now();
      const validLocks = locks.filter((l) => l.expiresAt > now);

      // Save purged locks
      localStorage.setItem(SEAT_LOCK_STORAGE_KEY, JSON.stringify(validLocks));

      const lockedSeatIdsForShow = new Set(
        validLocks
          .filter((l) => l.showId === showId)
          .flatMap((l) => l.seatIds)
      );

      return defaultSeats.map((seat) => {
        if (lockedSeatIdsForShow.has(seat.id) && seat.status === "AVAILABLE") {
          return { ...seat, status: "LOCKED" };
        }
        return seat;
      });
    } catch {
      return defaultSeats;
    }
  },

  lockSeats: (showId: string, seatIds: string[]): { success: boolean; expiresAt: number } => {
    const expiresAt = Date.now() + HOLD_MINUTES * 60 * 1000;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SEAT_LOCK_STORAGE_KEY);
        const locks: ActiveSeatLock[] = stored ? JSON.parse(stored) : [];
        const filtered = locks.filter((l) => l.showId !== showId && l.expiresAt > Date.now());

        filtered.push({ showId, seatIds, expiresAt });
        localStorage.setItem(SEAT_LOCK_STORAGE_KEY, JSON.stringify(filtered));
      } catch (err) {
        console.error("Failed to store seat lock", err);
      }
    }

    return { success: true, expiresAt };
  },

  validateAndLockSeats: async (
    showId: string,
    seatIds: string[],
    priceConfig: ShowPriceConfig
  ): Promise<{ success: boolean; expiresAt?: number; unavailableSeats?: string[]; error?: string }> => {
    // Try calling server API first if in browser
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/shows/${encodeURIComponent(showId)}/seats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatIds }),
        });

        if (res.ok) {
          const data = await res.json();
          // Also sync to local storage lock
          seatService.lockSeats(showId, seatIds);
          return { success: true, expiresAt: data.expiresAt };
        } else if (res.status === 409) {
          const errData = await res.json();
          return {
            success: false,
            unavailableSeats: errData.unavailableSeats || [],
            error:
              errData.error ||
              `Seat ${(errData.unavailableSeats || []).join(", ")} is no longer available. Please select another seat.`,
          };
        }
      } catch (networkErr) {
        // Fallback to local storage / memory validation
        console.warn("API lock fallback to client validation:", networkErr);
      }
    }

    // Client-side fallback check
    const currentSeats = await seatService.getSeatsForShow(showId, priceConfig);
    const seatMap = new Map(currentSeats.map((s) => [s.id, s]));
    const conflicts: string[] = [];

    for (const id of seatIds) {
      const seat = seatMap.get(id);
      if (!seat || seat.status === "OCCUPIED" || seat.status === "LOCKED") {
        conflicts.push(id);
      }
    }

    if (conflicts.length > 0) {
      return {
        success: false,
        unavailableSeats: conflicts,
        error: `Seat ${conflicts.join(", ")} is no longer available. Please select another seat.`,
      };
    }

    const lockRes = seatService.lockSeats(showId, seatIds);
    return { success: true, expiresAt: lockRes.expiresAt };
  },

  unlockSeats: (showId: string) => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SEAT_LOCK_STORAGE_KEY);
        if (stored) {
          const locks: ActiveSeatLock[] = JSON.parse(stored);
          const filtered = locks.filter((l) => l.showId !== showId);
          localStorage.setItem(SEAT_LOCK_STORAGE_KEY, JSON.stringify(filtered));
        }
      } catch (err) {
        console.error("Failed to clear seat lock", err);
      }
    }
  },

  getHoldMinutes: () => HOLD_MINUTES,
};
