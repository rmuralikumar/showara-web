import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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

    // 1. Verify authenticated server session
    const authSession = await auth();
    const sessionUser = authSession?.user;
    const session = getServerSession(request);

    if (!sessionUser && (!session || !session.user)) {
      return NextResponse.json(
        { error: "Authentication required to access booking details." },
        { status: 401 }
      );
    }

    // 2. Fetch booking from persistent server storage
    const booking = serverPaymentStore.getBooking(cleanId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 3. Verify user ownership authorization
    let isAuthorized = false;
    if (sessionUser) {
      if (sessionUser.id && booking.userId === sessionUser.id) {
        isAuthorized = true;
      } else if (
        sessionUser.email &&
        booking.userEmail &&
        sessionUser.email.toLowerCase() === booking.userEmail.toLowerCase()
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && session) {
      const authCheck = verifyBookingOwnership(session, booking);
      isAuthorized = authCheck.authorized;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to view this booking." },
        { status: 403 }
      );
    }

    // 4. Return safe, authorized booking data
    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (err: any) {
    console.error("API /api/bookings/[bookingId] error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve booking details" },
      { status: 500 }
    );
  }
}
