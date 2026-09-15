import { Booking, BookingFeeBreakdown, Seat } from "@/types/booking";

const BOOKINGS_STORAGE_KEY = "showara_user_bookings";
const CONVENIENCE_FEE_PER_TICKET = 35;
const GST_RATE = 0.18;

export const bookingService = {
  calculatePricing: (
    seats: Seat[],
    discountCode?: string
  ): BookingFeeBreakdown => {
    const ticketSubtotal = seats.reduce((acc, s) => acc + s.price, 0);
    const count = seats.length;
    const totalConvenienceFee = count * CONVENIENCE_FEE_PER_TICKET;
    const taxGst = Math.round(totalConvenienceFee * GST_RATE);

    let discount = 0;
    if (discountCode) {
      const code = discountCode.trim().toUpperCase();
      if (code === "SHOWARA50" && ticketSubtotal > 200) {
        discount = 50;
      } else if (code === "PREMIER100" && ticketSubtotal > 500) {
        discount = 100;
      }
    }

    const totalAmount = Math.max(
      0,
      ticketSubtotal + totalConvenienceFee + taxGst - discount
    );

    return {
      ticketSubtotal,
      convenienceFeePerTicket: CONVENIENCE_FEE_PER_TICKET,
      totalConvenienceFee,
      taxGst,
      discount,
      totalAmount,
    };
  },

  getAllBookings: (): Booking[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getBookingById: (id: string): Booking | null => {
    const bookings = bookingService.getAllBookings();
    return bookings.find((b) => b.id === id) || null;
  },

  saveBooking: (booking: Booking): Booking => {
    const bookings = bookingService.getAllBookings();
    const existingIndex = bookings.findIndex((b) => b.id === booking.id);
    if (existingIndex >= 0) {
      bookings[existingIndex] = booking;
    } else {
      bookings.unshift(booking);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
    return booking;
  },

  cancelBooking: async (
    id: string
  ): Promise<{ success: boolean; refundAmount: number; message: string; refundId?: string }> => {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const bookings = bookingService.getAllBookings();
          const booking = bookings.find((b) => b.id === id);
          if (booking) {
            booking.status = "CANCELLED";
            bookingService.saveBooking(booking);
          }
          return data;
        } else {
          return {
            success: false,
            refundAmount: 0,
            message: data.error || "Cancellation request failed.",
          };
        }
      } catch (err: any) {
        console.warn("Server cancellation fetch failed, falling back to local:", err);
      }
    }

    const bookings = bookingService.getAllBookings();
    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
      return { success: false, refundAmount: 0, message: "Booking not found" };
    }

    if (booking.status === "CANCELLED") {
      return { success: false, refundAmount: 0, message: "Booking is already cancelled" };
    }

    const refundAmount = booking.pricing.ticketSubtotal;
    booking.status = "CANCELLED";
    bookingService.saveBooking(booking);

    return {
      success: true,
      refundAmount,
      message: `Cancellation successful. ₹${refundAmount} has been refunded to your original payment method.`,
    };
  },
};
