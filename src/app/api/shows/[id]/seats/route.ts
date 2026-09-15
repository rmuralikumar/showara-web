import { NextRequest, NextResponse } from "next/server";
import { showService } from "@/services/showService";
import { generateSeatMapForShow } from "@/data/seats";
import { db } from "@/lib/db";

const HOLD_MINUTES = 8;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: showId } = await params;
  const show = await showService.getShowById(showId);

  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const now = Date.now();
  const defaultSeats = generateSeatMapForShow(showId, show.priceConfig);
  const { lockedSeatIds, bookedSeatIds } = db.getSeatStatusForShow(showId);

  const seats = defaultSeats.map((seat) => {
    if (bookedSeatIds.has(seat.id)) {
      return { ...seat, status: "OCCUPIED" as const };
    }
    if (lockedSeatIds.has(seat.id) && seat.status === "AVAILABLE") {
      return { ...seat, status: "LOCKED" as const };
    }
    return seat;
  });

  return NextResponse.json({
    showId,
    seats,
    timestamp: now,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: showId } = await params;
  const show = await showService.getShowById(showId);

  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const body = await request.json();
  const { seatIds, sessionId } = body as { seatIds: string[]; sessionId?: string };

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return NextResponse.json({ error: "No seat IDs provided" }, { status: 400 });
  }

  const clientSession = sessionId || "anonymous";

  // Check permanently occupied seats from base seat map
  const defaultSeats = generateSeatMapForShow(showId, show.priceConfig);
  const seatMap = new Map(defaultSeats.map((s) => [s.id, s]));

  const permanentlyOccupied: string[] = [];
  for (const id of seatIds) {
    const seat = seatMap.get(id);
    if (!seat || seat.status === "OCCUPIED") {
      permanentlyOccupied.push(id);
    }
  }

  if (permanentlyOccupied.length > 0) {
    return NextResponse.json(
      {
        success: false,
        unavailableSeats: permanentlyOccupied,
        error: `Seat ${permanentlyOccupied.join(", ")} is permanently occupied. Please select another seat.`,
      },
      { status: 409 }
    );
  }

  // Atomic transactional seat hold via persistent database
  const holdResult = db.holdSeats({
    showId,
    seatIds,
    sessionId: clientSession,
    holdMinutes: HOLD_MINUTES,
  });

  if (!holdResult.success) {
    return NextResponse.json(
      {
        success: false,
        unavailableSeats: holdResult.unavailableSeats || [],
        error:
          holdResult.error ||
          `One or more seats are no longer available. Please select alternate seats.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    expiresAt: holdResult.expiresAt,
    heldSeats: seatIds,
  });
}
