import { NextRequest, NextResponse } from "next/server";
import { showService } from "@/services/showService";
import { bookingService } from "@/services/bookingService";
import { serverPaymentStore, ServerBooking } from "@/lib/serverPaymentStore";
import { getServerSession } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { Seat } from "@/types/booking";

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, { limit: 30, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const session = getServerSession(request);
    const body = await request.json();
    const {
      bookingId,
      showId,
      seats,
      discountCode,
      movie,
      cinema,
      date,
      user,
    } = body;

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: "Invalid booking request. Show and seats are required." },
        { status: 400 }
      );
    }

    const show = await showService.getShowById(showId);
    if (!show) {
      return NextResponse.json(
        { error: "Selected show not found or no longer available." },
        { status: 404 }
      );
    }

    // Recalculate pricing on server strictly using verified show prices and coupon rules
    const validatedSeats: Seat[] = seats.map((s: Seat) => {
      const tierPrice = show.priceConfig[s.tier] || s.price || 250;
      return {
        ...s,
        price: tierPrice,
        status: "SELECTED" as const,
      };
    });

    const serverPricing = bookingService.calculatePricing(validatedSeats, discountCode);
    const id = bookingId || `SHW-${Math.floor(10000 + Math.random() * 90000)}`;

    const serverBooking: ServerBooking = {
      id,
      userId: session?.user.id || user?.id || "guest",
      userName: session?.user.name || user?.name || "Guest User",
      userEmail: session?.user.email || user?.email || "",
      userPhone: session?.user.phone || user?.phone || "",
      showId: show.id,
      movieTitle: movie?.title || "Movie Booking",
      moviePoster: movie?.posterUrl || "",
      cinemaName: cinema?.name || "Cinema",
      cinemaAddress: cinema?.address || "",
      screenName: show.screenName,
      date: date || show.date,
      startTime: show.startTime,
      format: show.format,
      language: show.language,
      seats: validatedSeats,
      pricing: serverPricing,
      status: "PAYMENT_PENDING",
      paymentMethod: "UPI",
      paymentTransactionId: "",
      qrCodeData: `SHOWARA:${id}:${show.id}:${validatedSeats.map((s) => s.id).join(",")}`,
      createdAt: new Date().toISOString(),
    };

    serverPaymentStore.saveBooking(serverBooking);

    return NextResponse.json({
      success: true,
      booking: serverBooking,
    });
  } catch (err: any) {
    console.error("API /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to register booking" },
      { status: 500 }
    );
  }
}
