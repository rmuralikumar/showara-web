import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRazorpayClient, inrToPaise } from "@/lib/razorpay";
import { getServerSession, verifyBookingOwnership } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    // 1. Rate limiting check
    const rl = checkRateLimit(request, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const { bookingId } = await params;

    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length === 0) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const cleanId = bookingId.trim();

    // 2. Server-side session authentication
    const session = getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to cancel a booking." },
        { status: 401 }
      );
    }

    // 3. Fetch booking from persistent database
    const booking = db.getBooking(cleanId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 4. Ownership authorization check
    const authCheck = verifyBookingOwnership(session, booking);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to cancel this booking." },
        { status: 403 }
      );
    }

    // 5. Idempotency: If already cancelled, return existing refund details safely
    if (booking.status === "CANCELLED") {
      const existingRefund = db.getRefundForBooking(cleanId);
      return NextResponse.json({
        success: true,
        refundAmount: existingRefund?.amount || booking.pricing.ticketSubtotal,
        refundId: existingRefund?.razorpayRefundId || "ALREADY_CANCELLED",
        message: "Booking is already cancelled.",
        duplicate: true,
      });
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: `Cannot cancel booking in ${booking.status} state.` },
        { status: 400 }
      );
    }

    // 6. Showara refund policy: Tickets refunded, convenience fee non-refundable
    const refundAmount = booking.pricing.ticketSubtotal;
    const amountInPaise = inrToPaise(refundAmount);
    let refundId = `ref_local_${Date.now()}`;
    let refundStatus = "processed";

    // 7. Trigger REAL Razorpay refund API if real payment ID is present
    if (booking.paymentTransactionId && !booking.paymentTransactionId.startsWith("TXN-")) {
      try {
        const razorpay = getRazorpayClient();
        const rzpRefund = await razorpay.payments.refund(booking.paymentTransactionId, {
          amount: amountInPaise,
          notes: {
            bookingId: booking.id,
            cancelledBy: session.user.id,
            reason: "Customer cancellation",
          },
        });
        refundId = rzpRefund.id;
        refundStatus = rzpRefund.status || "processed";
      } catch (rzpErr: any) {
        console.error("Razorpay refund API call error:", rzpErr);
        return NextResponse.json(
          {
            error:
              rzpErr?.error?.description ||
              rzpErr?.message ||
              "Failed to process refund with Razorpay. Please retry or contact support.",
          },
          { status: 502 }
        );
      }
    }

    // 8. Atomically record refund and release booked seats in persistent database
    const recordResult = db.recordRefund({
      bookingId: booking.id,
      razorpayPaymentId: booking.paymentTransactionId || `pay_manual_${Date.now()}`,
      razorpayRefundId: refundId,
      amount: refundAmount,
      amountInPaise,
      status: refundStatus,
      reason: "Customer cancellation request",
    });

    if (!recordResult.success) {
      return NextResponse.json(
        { error: recordResult.error || "Failed to finalize cancellation record in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refundAmount,
      refundId,
      message: `Cancellation successful. ₹${refundAmount} has been refunded to your original payment method.`,
    });
  } catch (err: any) {
    console.error("API /api/bookings/[bookingId]/cancel error:", err);
    return NextResponse.json(
      { error: "Internal server error during cancellation." },
      { status: 500 }
    );
  }
}
