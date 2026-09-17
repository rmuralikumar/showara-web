import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient, getRazorpayCredentials, inrToPaise } from "@/lib/razorpay";
import { serverPaymentStore, ServerBooking } from "@/lib/serverPaymentStore";
import { showService } from "@/services/showService";
import { bookingService } from "@/services/bookingService";
import { getServerSession } from "@/lib/auth";
import { auth } from "@/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { Seat } from "@/types/booking";

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, { limit: 20, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const authSession = await auth();
    const sessionUser = authSession?.user;
    const session = getServerSession(request);
    const body = await request.json();
    const { bookingId, amount, bookingDetails } = body;

    // 1. Validate bookingId
    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid booking ID provided" },
        { status: 400 }
      );
    }

    const cleanBookingId = bookingId.trim();

    // 2. Validate amount
    if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount provided" },
        { status: 400 }
      );
    }

    // 3. Lookup or initialize server-side booking
    let booking = serverPaymentStore.getBooking(cleanBookingId);

    if (!booking && bookingDetails) {
      // Auto-register pending booking if valid details are provided
      const { showId, seats, discountCode, movie, cinema, date, user } = bookingDetails;
      if (showId && Array.isArray(seats) && seats.length > 0) {
        const show = await showService.getShowById(showId);
        if (show) {
          const validatedSeats: Seat[] = seats.map((s: Seat) => ({
            ...s,
            price: show.priceConfig[s.tier] || s.price || 250,
            status: "SELECTED" as const,
          }));

          const pricing = bookingService.calculatePricing(validatedSeats, discountCode);
          booking = {
            id: cleanBookingId,
            userId: sessionUser?.id || session?.user.id || user?.id || (sessionUser?.email ? `usr_${sessionUser.email}` : "user"),
            userName: sessionUser?.name || session?.user.name || user?.name || "Moviegoer",
            userEmail: sessionUser?.email || session?.user.email || user?.email || "",
            userPhone: "",
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
            pricing,
            status: "PAYMENT_PENDING",
            paymentMethod: "UPI",
            paymentTransactionId: "",
            qrCodeData: `SHOWARA:${cleanBookingId}:${show.id}:${validatedSeats.map((s) => s.id).join(",")}`,
            createdAt: new Date().toISOString(),
          };
          serverPaymentStore.saveBooking(booking);
        }
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking session not found. Please re-initiate booking." },
        { status: 404 }
      );
    }

    // 4. Prevent duplicate payment on already confirmed booking
    if (booking.status === "CONFIRMED") {
      return NextResponse.json(
        {
          error: "Booking is already confirmed and paid.",
          bookingReference: booking.id,
        },
        { status: 400 }
      );
    }

    if (booking.status === "CANCELLED" || booking.status === "EXPIRED") {
      return NextResponse.json(
        { error: `Cannot process payment. Booking has expired or was cancelled.` },
        { status: 400 }
      );
    }

    // 5. Verify that the requested seats are still reserved and not taken
    const seatIds = booking.seats.map((s) => s.id);
    const holdCheck = serverPaymentStore.verifySeatHoldValid({
      showId: booking.showId,
      seatIds,
    });
    if (!holdCheck.valid) {
      return NextResponse.json(
        {
          error: holdCheck.error || "Seat reservation expired. Please re-select your seats.",
        },
        { status: 409 }
      );
    }

    // 6. Server-side amount verification: NEVER trust client amount
    const serverExpectedTotal = booking.pricing.totalAmount;
    if (Math.abs(amount - serverExpectedTotal) > 0.01) {
      return NextResponse.json(
        {
          error: `Payment amount mismatch: expected ₹${serverExpectedTotal}, received ₹${amount}.`,
        },
        { status: 400 }
      );
    }

    // 7. Convert INR to paise accurately
    const amountInPaise = inrToPaise(serverExpectedTotal);

    // 8. Idempotency Check: reuse active unexpired order for this booking
    const existingOrder = serverPaymentStore.getActiveOrderForBooking(cleanBookingId);
    const { keyId } = getRazorpayCredentials();

    if (existingOrder && existingOrder.amountInPaise === amountInPaise) {
      return NextResponse.json({
        orderId: existingOrder.razorpayOrderId,
        amount: serverExpectedTotal,
        amountInPaise,
        currency: "INR",
        keyId,
      });
    }

    // 8. Create Razorpay order on server
    const razorpay = getRazorpayClient();
    const cleanReceipt = `rcpt_${cleanBookingId.replace(/[^a-zA-Z0-9_]/g, "").slice(-30)}_${Date.now().toString().slice(-4)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: cleanReceipt,
      notes: {
        bookingId: cleanBookingId,
        movie: booking.movieTitle,
        seats: booking.seats.map((s) => s.id).join(", "),
      },
    });

    // 9. Save payment record in server persistence
    const now = new Date().toISOString();
    serverPaymentStore.savePaymentRecord({
      id: `PAY-${Date.now()}`,
      bookingId: cleanBookingId,
      razorpayOrderId: razorpayOrder.id,
      amount: serverExpectedTotal,
      amountInPaise,
      currency: "INR",
      status: "CREATED",
      createdAt: now,
      updatedAt: now,
    });

    // 10. Return only client-safe fields (never secret credentials)
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: serverExpectedTotal,
      amountInPaise,
      currency: "INR",
      keyId,
    });
  } catch (err: any) {
    console.error("API /api/payment/create-order error:", err);
    return NextResponse.json(
      {
        error: err?.message || "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}
