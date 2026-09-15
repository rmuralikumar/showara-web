import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { serverPaymentStore } from "@/lib/serverPaymentStore";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256 webhook signature
    const isValid = verifyWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn("Razorpay webhook signature verification failed.");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 2. Parse event payload
    let eventPayload: any;
    try {
      eventPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const eventId = eventPayload.id || `evt_${Date.now()}`;
    const eventType = eventPayload.event;

    // 3. Idempotency Check: prevent duplicate event processing
    if (serverPaymentStore.hasWebhookBeenProcessed(eventId)) {
      return NextResponse.json({
        status: "ok",
        message: "Webhook event already processed (idempotent)",
        duplicate: true,
      });
    }

    // 4. Handle events safely
    if (eventType === "payment.captured" || eventType === "payment.authorized") {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const bookingId = paymentEntity?.notes?.bookingId;

      const targetBooking = bookingId
        ? serverPaymentStore.getBooking(bookingId)
        : orderId
        ? serverPaymentStore.getBookingByOrderId(orderId)
        : null;

      if (targetBooking && orderId && paymentId) {
        serverPaymentStore.confirmBookingPayment(targetBooking.id, {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
        });
      }
    } else if (eventType === "order.paid") {
      const orderEntity = eventPayload.payload?.order?.entity;
      const orderId = orderEntity?.id;
      const bookingId = orderEntity?.notes?.bookingId;

      const targetBooking = bookingId
        ? serverPaymentStore.getBooking(bookingId)
        : orderId
        ? serverPaymentStore.getBookingByOrderId(orderId)
        : null;

      if (targetBooking && orderId) {
        // Look up payment ID if available
        const paymentRecord = serverPaymentStore.getPaymentRecordByOrderId(orderId);
        serverPaymentStore.confirmBookingPayment(targetBooking.id, {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentRecord?.razorpayPaymentId || `pay_wh_${orderId}`,
        });
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = eventPayload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const bookingId = paymentEntity?.notes?.bookingId;
      const reason =
        paymentEntity?.error_description || "Payment failed via webhook notification";

      if (bookingId && orderId) {
        serverPaymentStore.recordPaymentFailure(bookingId, orderId, reason, paymentId);
      }
    } else if (eventType === "refund.processed" || eventType === "refund.created") {
      const refundEntity = eventPayload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      const bookingId = refundEntity?.notes?.bookingId;
      if (bookingId) {
        const booking = serverPaymentStore.getBooking(bookingId);
        if (booking && booking.status !== "CANCELLED") {
          db.recordRefund({
            bookingId: booking.id,
            razorpayPaymentId: paymentId || booking.paymentTransactionId || "",
            razorpayRefundId: refundEntity?.id || `ref_${Date.now()}`,
            amount: (refundEntity?.amount || 0) / 100,
            amountInPaise: refundEntity?.amount || 0,
            status: refundEntity?.status || "processed",
            reason: "Refund processed via webhook",
          });
        }
      }
    }

    // 5. Record event as processed in persistent database
    serverPaymentStore.markWebhookProcessed(eventId, eventType, eventPayload);

    return NextResponse.json({
      status: "ok",
      event: eventType,
      processed: true,
    });
  } catch (err: any) {
    console.error("API /api/payment/webhook error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
