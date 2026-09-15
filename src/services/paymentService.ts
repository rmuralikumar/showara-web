import { Booking, PaymentMethod } from "@/types/booking";

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  booking?: Booking;
  message?: string;
  error?: string;
  duplicate?: boolean;
}

export interface PaymentStatusResponse {
  bookingId: string;
  status: string;
  amount: number;
  currency: string;
  paymentId: string | null;
  orderId: string | null;
  bookingReference: string | null;
  confirmedAt: string | null;
}

export const paymentService = {
  /**
   * Dynamically loads the official Razorpay Checkout v1 script
   */
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById("razorpay-checkout-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Calls server-side /api/payment/create-order to generate a verified Razorpay order
   */
  createOrder: async (payload: {
    bookingId: string;
    amount: number;
    bookingDetails?: any;
  }): Promise<CreateOrderResponse> => {
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create payment order");
    }

    return data;
  },

  /**
   * Calls server-side /api/payment/verify to verify Razorpay HMAC signature
   */
  verifyPayment: async (
    payload: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> => {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Payment verification failed");
    }

    return data;
  },

  /**
   * Checks server-side payment status for a booking
   */
  getStatus: async (bookingId: string): Promise<PaymentStatusResponse> => {
    const res = await fetch(`/api/payment/status/${encodeURIComponent(bookingId)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to check payment status");
    }
    return data;
  },
};
