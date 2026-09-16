"use client";

import React, { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { seatService } from "@/services/seatService";
import {
  ChevronLeft,
  Tag,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function BookingReviewPage() {
  const router = useRouter();
  const { draft, applyDiscountCode, removeSelectedSeats, remainingSeconds } = useBooking();
  const { user, updateProfile } = useAuth();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [userPhone, setUserPhone] = useState(user.phone);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!draft.show || !draft.movie || !draft.cinema || draft.selectedSeats.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-main)]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">No Active Booking Found</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your seat hold session may have expired or was not initiated.
        </p>
        <Link
          href="/movies"
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Discover Movies
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMessage(null);
    const code = couponInput.trim().toUpperCase();

    if (code === "SHOWARA50") {
      applyDiscountCode("SHOWARA50");
      setCouponMessage({ type: "success", text: "SHOWARA50 applied! ₹50 discount added." });
    } else if (code === "PREMIER100") {
      applyDiscountCode("PREMIER100");
      setCouponMessage({ type: "success", text: "PREMIER100 applied! ₹100 discount added." });
    } else {
      setCouponMessage({ type: "error", text: "Invalid promo code. Try SHOWARA50 or PREMIER100." });
    }
  };

  const handleProceedToPayment = async () => {
    if (isProcessing) return;
    if (!draft.show || draft.selectedSeats.length === 0) return;

    if (remainingSeconds <= 0 && draft.seatHoldExpiry) {
      setErrorMessage("Your seat reservation has expired. Redirecting to seat selection...");
      setTimeout(() => {
        router.push(`/book/${draft.show?.id}`);
      }, 1200);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const selectedIds = draft.selectedSeats.map((s) => s.id);
      const validationRes = await seatService.validateAndLockSeats(
        draft.show.id,
        selectedIds,
        draft.show.priceConfig
      );

      if (!validationRes.success) {
        const unavailable =
          validationRes.unavailableSeats && validationRes.unavailableSeats.length > 0
            ? validationRes.unavailableSeats
            : selectedIds;
        removeSelectedSeats(unavailable);
        router.push(`/book/${draft.show.id}`);
        return;
      }

      updateProfile({ name: userName, email: userEmail, phone: userPhone });
      router.push("/booking/payment");
    } catch {
      setErrorMessage("Unable to verify seat availability. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Modify Seat Selection</span>
          </button>
          <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            Step 2 of 3: Review
          </span>
        </div>

        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Review Your Booking</h1>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Movie & Showtime Details */}
          <div className="md:col-span-7 space-y-6">
            {/* Show Details Card */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-xl flex gap-4">
              <div className="relative w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                <SafeImage
                  src={draft.movie.posterUrl}
                  alt={draft.movie.title}
                  type="poster"
                  fallbackTitle={draft.movie.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] uppercase">
                    {draft.movie.certification}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--brand-primary)] text-white">
                    {draft.show.format}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)] truncate">{draft.movie.title}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {draft.cinema.name} • {draft.show.screenName}
                </p>

                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    {draft.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    {draft.show.startTime}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-primary)]">
                  <span className="text-[var(--text-muted)]">Seats: </span>
                  <strong className="text-[var(--brand-primary)]">
                    {draft.selectedSeats.map((s) => s.id).join(", ")}
                  </strong>{" "}
                  ({draft.selectedSeats.length} Tickets)
                </div>
              </div>
            </div>

            {/* Contact Information Form */}
            <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Contact Details (For M-Ticket Delivery)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Your digital ticket and confirmation receipt will be delivered instantly via SMS and Email.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-[var(--text-muted)] block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[var(--text-muted)] block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-[var(--text-muted)] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Transparent pricing guarantee: zero hidden fees. Cinema tickets are backed by official multiplex integration.
              </span>
            </div>
          </div>

          {/* Right Column: Pricing & Coupon */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-3 border-b border-[var(--border-subtle)]">
                Order Summary
              </h3>

              {/* Promo Coupon Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo Code (SHOWARA50)"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] uppercase placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all touch-target"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <p
                    className={`text-[11px] mt-2 ${
                      couponMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Transparent Price Breakdown */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Tickets ({draft.selectedSeats.length} × Seats)</span>
                  <span className="text-[var(--text-primary)] font-semibold">₹{draft.pricing.ticketSubtotal}</span>
                </div>

                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <span>Convenience Fee</span>
                    <span className="text-[10px] text-[var(--text-muted)]">(₹35/ticket)</span>
                  </div>
                  <span className="text-[var(--text-primary)] font-semibold">
                    ₹{draft.pricing.totalConvenienceFee}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Integrated GST (18%)</span>
                  <span className="text-[var(--text-primary)] font-semibold">₹{draft.pricing.taxGst}</span>
                </div>

                {draft.pricing.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Coupon ({draft.discountCode})</span>
                    <span>-₹{draft.pricing.discount}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-[var(--text-primary)]">Amount Payable</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Includes all taxes & fees</div>
                  </div>
                  <div className="text-2xl font-black text-[var(--brand-primary)]">
                    ₹{draft.pricing.totalAmount}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isProcessing || (remainingSeconds <= 0 && !!draft.seatHoldExpiry)}
                onClick={handleProceedToPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm font-bold shadow-lg shadow-[var(--brand-primary-glow)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all touch-target flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <span>• ₹{draft.pricing.totalAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
