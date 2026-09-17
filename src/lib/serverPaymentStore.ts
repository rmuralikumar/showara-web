import { db, DBBookingRecord, DBPaymentRecord } from "./db";
import { PaymentMethod } from "@/types/booking";

export type PaymentRecord = DBPaymentRecord;
export type ServerBooking = DBBookingRecord;

/**
 * Server-side persistent storage adapter.
 * Backed by persistent transactional database (SQLite / PostgreSQL) in src/lib/db.ts.
 */
export const serverPaymentStore = {
  getBooking(bookingId: string): ServerBooking | null {
    return db.getBooking(bookingId);
  },

  getBookingByOrderId(orderId: string): ServerBooking | null {
    return db.getBookingByOrderId(orderId);
  },

  getBookingsForUser(userId: string, userEmail?: string): ServerBooking[] {
    return db.getBookingsForUser(userId, userEmail);
  },

  saveBooking(booking: ServerBooking): ServerBooking {
    return db.saveBooking(booking);
  },

  getActiveOrderForBooking(bookingId: string): PaymentRecord | null {
    return db.getActiveOrderForBooking(bookingId);
  },

  savePaymentRecord(record: PaymentRecord): PaymentRecord {
    return db.savePayment(record);
  },

  getPaymentRecordByOrderId(orderId: string): PaymentRecord | null {
    return db.getPaymentByOrderId(orderId);
  },

  getPaymentRecordByBookingId(bookingId: string): PaymentRecord | null {
    return db.getActiveOrderForBooking(bookingId);
  },

  confirmBookingPayment(
    bookingId: string,
    paymentData: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      paymentMethod?: PaymentMethod;
    }
  ): { success: boolean; booking?: ServerBooking; error?: string } {
    return db.confirmBookingAndSeats(paymentData.razorpayOrderId ? {
      bookingId,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpayPaymentId: paymentData.razorpayPaymentId,
      paymentMethod: paymentData.paymentMethod,
    } : {
      bookingId,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpayPaymentId: paymentData.razorpayPaymentId,
    });
  },

  recordPaymentFailure(
    bookingId: string,
    orderId: string,
    reason: string,
    paymentId?: string
  ): void {
    db.recordPaymentFailure(bookingId, orderId, reason, paymentId);
  },

  hasWebhookBeenProcessed(eventId: string): boolean {
    return db.hasWebhookBeenProcessed(eventId);
  },

  markWebhookProcessed(eventId: string, eventType: string = "webhook", payload?: any): void {
    db.markWebhookProcessed(eventId, eventType, payload);
  },

  verifySeatHoldValid(params: {
    showId: string;
    seatIds: string[];
    sessionId?: string;
  }): { valid: boolean; error?: string } {
    return db.verifySeatHoldValid(params);
  },
};
