"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { Booking, PaymentMethod } from "@/types/booking";
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function BookingPaymentPage() {
  const router = useRouter();
  const { draft, clearBooking, remainingSeconds } = useBooking();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingRefId, setBookingRefId] = useState<string>("");

  // Initialize or maintain a stable booking ID for this session draft
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDraft = sessionStorage.getItem("showara_active_draft");
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft);
          if (parsed.sessionBookingId) {
            setBookingRefId(parsed.sessionBookingId);
            return;
          }
        } catch {}
      }
      const newId = `SHW-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRefId(newId);
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft);
          parsed.sessionBookingId = newId;
          sessionStorage.setItem("showara_active_draft", JSON.stringify(parsed));
        } catch {}
      }
    }
  }, []);

  // Pre-load Razorpay checkout script in background
  useEffect(() => {
    paymentService.loadRazorpayScript().catch((err) => {
      console.warn("Pre-loading Razorpay script:", err);
    });
  }, []);

  if (!draft.show || !draft.movie || !draft.cinema || draft.selectedSeats.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-main)]">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment Session Expired</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your seat hold session has ended or is no longer active.
        </p>
        <Link
          href="/movies"
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Return to Movies
        </Link>
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePayWithRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return; // Prevent double click
    if (!draft.show || !draft.movie || !draft.cinema) return;

    if (remainingSeconds <= 0 && draft.seatHoldExpiry) {
      setErrorMessage("Your seat hold has expired. Please select your seats again.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setProcessingStatus("Initializing secure INR payment...");

    try {
      // 1. Ensure Razorpay Checkout script is loaded
      const isScriptLoaded = await paymentService.loadRazorpayScript();
      if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
        throw new Error(
          "Failed to load Razorpay payment gateway. Please check your internet connection and retry."
        );
      }

      // 2. Request real order creation from server API
      setProcessingStatus("Generating verified Razorpay order...");
      const orderData = await paymentService.createOrder({
        bookingId: bookingRefId,
        amount: draft.pricing.totalAmount,
        bookingDetails: {
          showId: draft.show.id,
          seats: draft.selectedSeats,
          discountCode: draft.discountCode,
          movie: draft.movie,
          cinema: draft.cinema,
          date: draft.date,
          user,
        },
      });

      // 3. Configure Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: "INR",
        name: "Showara",
        description: `${draft.movie.title} (${draft.selectedSeats.length} Seat${
          draft.selectedSeats.length > 1 ? "s" : ""
        })`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || "Moviegoer",
          email: user.email || "guest@showara.com",
          contact: user.phone || "+919876543210",
        },
        theme: {
          color: "#e50914",
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setProcessingStatus("");
            setErrorMessage(
              "Payment window was closed. Your seats remain reserved until the timer expires. You can retry paying whenever ready."
            );
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setProcessingStatus("Verifying payment with bank & finalizing booking...");

            // 4. Server-side payment signature verification
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingRefId,
            });

            if (!verifyRes.success || !verifyRes.booking) {
              throw new Error(
                verifyRes.error || "Payment verification failed on the server."
              );
            }

            // 5. Success: save verified booking locally for instant receipt access
            const confirmedBooking: Booking = {
              ...verifyRes.booking,
              paymentTransactionId: response.razorpay_payment_id,
              paymentMethod: "UPI",
            };

            bookingService.saveBooking(confirmedBooking);
            clearBooking();

            // 6. Navigate to official Showara ticket confirmation page
            router.push(`/booking/confirmation/${bookingRefId}`);
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            setProcessing(false);
            setProcessingStatus("");
            setErrorMessage(
              verifyErr?.message ||
                "Payment was received, but server verification encountered an issue. Please contact Showara support with order ID " +
                  response.razorpay_order_id
            );
          }
        },
      };

      // 4. Launch Razorpay Checkout Modal
      setProcessingStatus("Waiting for payment completion in Razorpay...");
      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", (failResponse: any) => {
        setProcessing(false);
        setProcessingStatus("");
        const desc =
          failResponse?.error?.description ||
          "Payment was declined by the bank or payment method. Please retry with another method.";
        setErrorMessage(`Payment Failed: ${desc}`);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setProcessing(false);
      setProcessingStatus("");
      setErrorMessage(
        err?.message || "An unexpected error occurred while initiating payment. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen py-8 bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={processing}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Review</span>
          </button>
          <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            Step 3 of 3: Payment
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Real Online INR Payment
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Secure INR transaction processed via official Razorpay Payment Gateway
            </p>
          </div>
          <div className="flex items-center gap-3">
            {remainingSeconds > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Seats Held: {formatTimer(remainingSeconds)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)]">Amount:</span>
              <span className="text-lg font-black text-[var(--brand-primary)]">
                ₹{draft.pricing.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-white hover:underline text-[11px] ml-4 flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Payment Gateway Information (Left Column) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Supported Payment Options
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Razorpay Verified
                </span>
              </div>

              {/* Supported methods list */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="p-2 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      Instant UPI & QR Code
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Google Pay, PhonePe, Paytm, BHIM, CRED
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="p-2 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      Credit & Debit Cards
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Visa, MasterCard, RuPay, Diners, American Express
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  <div className="p-2 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      Net Banking & Wallets
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      HDFC, ICICI, SBI, Axis, Kotak, and 50+ retail banks
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>RBI-compliant 256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>No card credentials or UPI PINs are ever stored by Showara</span>
                </div>
              </div>
            </div>

            {/* Booking Reference Information */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
              <div className="flex justify-between">
                <span>Booking Session:</span>
                <span className="font-mono text-white font-bold">{bookingRefId}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Seats:</span>
                <span className="text-white font-semibold">
                  {draft.selectedSeats.map((s) => s.id).join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Action Card (Right Column) */}
          <div className="md:col-span-7">
            <div className="p-6 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Order Summary & Authorization
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Review ticket charges and authorize the exact payable INR amount
                </p>
              </div>

              {/* Movie and Showtime Quick Card */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {draft.movie.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {draft.cinema.name} • {draft.show.screenName}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    {draft.date} • {draft.show.startTime} ({draft.show.format})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white">
                    {draft.selectedSeats.length} Ticket{draft.selectedSeats.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Transparent Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>
                    Tickets ({draft.selectedSeats.length} × ₹
                    {Math.round(draft.pricing.ticketSubtotal / draft.selectedSeats.length)})
                  </span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    ₹{draft.pricing.ticketSubtotal}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Convenience Fee</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    ₹{draft.pricing.totalConvenienceFee}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Integrated GST (18%)</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    ₹{draft.pricing.taxGst}
                  </span>
                </div>

                {draft.pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount Applied ({draft.discountCode})</span>
                    <span>-₹{draft.pricing.discount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-[var(--text-primary)]">
                      Total Payable Amount
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      Official INR charges verified by server
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[var(--brand-primary)]">
                    ₹{draft.pricing.totalAmount}
                  </div>
                </div>
              </div>

              {/* Payment Processing Status Indicator */}
              {processing && (
                <div className="p-4 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-xs flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold">Transaction in Progress</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {processingStatus || "Communicating with Razorpay..."}
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePayWithRazorpay}
                disabled={processing || remainingSeconds <= 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm font-bold shadow-lg shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all touch-target flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payment Securely...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{draft.pricing.totalAmount} via Razorpay</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[var(--text-muted)]">
                Clicking above opens the official Razorpay Checkout window. Upon successful verification, your Showara booking will be confirmed immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
