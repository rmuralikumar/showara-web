import { NextRequest, NextResponse } from "next/server";
import { serverPaymentStore } from "@/lib/serverPaymentStore";
import { getServerSession, verifyBookingOwnership } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length === 0) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const cleanId = bookingId.trim();

    // 1. Authenticate server session
    const session = getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required to view payment status." },
        { status: 401 }
      );
    }

    const booking = serverPaymentStore.getBooking(cleanId);
    const payment = serverPaymentStore.getPaymentRecordByBookingId(cleanId);

    if (!booking && !payment) {
      return NextResponse.json(
        { error: "No booking or payment found for this reference" },
        { status: 404 }
      );
    }

    // 2. Ownership authorization check if booking exists
    if (booking) {
      const authCheck = verifyBookingOwnership(session, booking);
      if (!authCheck.authorized) {
        return NextResponse.json(
          { error: "Access denied. You do not have permission to view this payment." },
          { status: 403 }
        );
      }
    }

    const isConfirmed = booking?.status === "CONFIRMED";

    return NextResponse.json({
      bookingId: cleanId,
      status: booking?.status || payment?.status || "UNKNOWN",
      amount: booking?.pricing.totalAmount ?? payment?.amount ?? 0,
      currency: "INR",
      paymentId: booking?.paymentTransactionId || payment?.razorpayPaymentId || null,
      orderId: booking?.razorpayOrderId || payment?.razorpayOrderId || null,
      bookingReference: isConfirmed ? booking.id : null,
      confirmedAt: booking?.confirmedAt || null,
      createdAt: booking?.createdAt || payment?.createdAt || null,
    });
  } catch (err: any) {
    console.error("API /api/payment/status error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
