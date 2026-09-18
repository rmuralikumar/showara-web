import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature, getRazorpayClient } from "@/lib/razorpay";
import { serverPaymentStore } from "@/lib/serverPaymentStore";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { PaymentMethod } from "@/types/booking";

/**
 * Maps Razorpay's actual payment method string (e.g. "upi", "card",
 * "netbanking", "wallet", "emi") to Showara's PaymentMethod union.
 */
function mapRazorpayMethod(method: string | undefined): PaymentMethod {
  switch (method) {
    case "upi":
      return "UPI";
    case "netbanking":
      return "NETBANKING";
    default:
      return "CARD";
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, { limit: 20, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = body;

    // 1. Validate required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required payment verification parameters.",
        },
        { status: 400 }
      );
    }

    const cleanBookingId = String(bookingId).trim();
    const cleanOrderId = String(razorpay_order_id).trim();
    const cleanPaymentId = String(razorpay_payment_id).trim();
    const cleanSignature = String(razorpay_signature).trim();

    // 2. Fetch server booking
    const booking = serverPaymentStore.getBooking(cleanBookingId);
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking record not found on server.",
        },
        { status: 404 }
      );
    }

    // 3. Idempotency Check: if booking is already confirmed with this payment
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        booking,
        message: "Payment already verified and booking confirmed.",
        duplicate: true,
      });
    }

    if (booking.status === "CANCELLED" || booking.status === "EXPIRED") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot verify payment: Booking is in ${booking.status} state.`,
        },
        { status: 400 }
      );
    }

    // 4. Verify Razorpay HMAC-SHA256 signature on server
    const isSignatureValid = verifyPaymentSignature({
      orderId: cleanOrderId,
      paymentId: cleanPaymentId,
      signature: cleanSignature,
    });

    if (!isSignatureValid) {
      serverPaymentStore.recordPaymentFailure(
        cleanBookingId,
        cleanOrderId,
        "Signature verification failed",
        cleanPaymentId
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Razorpay payment signature. Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // 5. Verify order belongs to the current booking and matches authoritative amount
    const paymentRecord = serverPaymentStore.getPaymentRecordByOrderId(cleanOrderId);
    if (
      (booking.razorpayOrderId && booking.razorpayOrderId !== cleanOrderId) ||
      (paymentRecord && paymentRecord.bookingId !== cleanBookingId)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Security error: Payment order does not match booking reference.",
        },
        { status: 400 }
      );
    }

    if (paymentRecord && Math.abs(paymentRecord.amount - booking.pricing.totalAmount) > 0.01) {
      serverPaymentStore.recordPaymentFailure(
        cleanBookingId,
        cleanOrderId,
        "Amount mismatch during verification",
        cleanPaymentId
      );
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount mismatch: order amount ₹${paymentRecord.amount} does not match booking amount ₹${booking.pricing.totalAmount}.`,
        },
        { status: 400 }
      );
    }

    // 6. Fetch the actual payment method the user selected/completed with in
    // Razorpay Checkout. The client callback only provides the payment id,
    // order id, and signature -- not the method used -- so it must be looked
    // up server-side from Razorpay directly (the only authoritative source).
    let paymentMethod: PaymentMethod | undefined;
    try {
      const razorpayPayment = await getRazorpayClient().payments.fetch(cleanPaymentId);
      paymentMethod = mapRazorpayMethod(razorpayPayment.method);
    } catch (fetchErr) {
      console.error("Failed to fetch Razorpay payment method for", cleanPaymentId, fetchErr);
    }

    // 7. Confirm booking in server persistence
    const confirmResult = serverPaymentStore.confirmBookingPayment(cleanBookingId, {
      razorpayOrderId: cleanOrderId,
      razorpayPaymentId: cleanPaymentId,
      paymentMethod,
    });

    if (!confirmResult.success || !confirmResult.booking) {
      return NextResponse.json(
        {
          success: false,
          error: confirmResult.error || "Failed to confirm booking payment.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: confirmResult.booking,
      message: "Payment successfully verified and booking confirmed.",
    });
  } catch (err: any) {
    console.error("API /api/payment/verify error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error during verification.",
      },
      { status: 500 }
    );
  }
}
