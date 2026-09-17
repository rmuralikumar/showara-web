"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Film,
} from "lucide-react";

export default function BookingsHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "CANCELLED">("ALL");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelStatusMessage, setCancelStatusMessage] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      const res = await fetch("/api/user/bookings");
      if (res.ok) {
        const data = await res.json();
        if (data.bookings && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch server bookings, falling back to local:", err);
    }
    const list = bookingService.getAllBookings();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "UPCOMING") return b.status === "CONFIRMED";
    if (activeTab === "CANCELLED") return b.status === "CANCELLED";
    return true;
  });

  const handleOpenCancelModal = (booking: Booking) => {
    setCancelModalBooking(booking);
    setCancelStatusMessage(null);
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalBooking) return;
    setCancellingBookingId(cancelModalBooking.id);
    const result = await bookingService.cancelBooking(cancelModalBooking.id);
    setCancelStatusMessage(result.message);
    loadBookings();
    setCancellingBookingId(null);
    setTimeout(() => {
      setCancelModalBooking(null);
      setCancelStatusMessage(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-10 pb-16 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Booking History
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Manage your cinema reservations, view digital M-Tickets, or cancel eligible tickets
            </p>
          </div>

          <Link
            href="/movies"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all touch-target w-fit"
          >
            <Ticket className="w-4 h-4" />
            <span>Book New Tickets</span>
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[var(--border-subtle)] pb-2">
          {[
            { id: "ALL", label: `All Bookings (${bookings.length})` },
            { id: "UPCOMING", label: `Confirmed (${bookings.filter((b) => b.status === "CONFIRMED").length})` },
            { id: "CANCELLED", label: `Cancelled (${bookings.filter((b) => b.status === "CANCELLED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-[var(--bg-surface-card)] rounded-3xl border border-[var(--border-subtle)] space-y-3">
            <Film className="w-12 h-12 text-[var(--text-muted)] mx-auto" />
            <h3 className="text-base font-bold text-white">No Bookings Found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              You do not have any {activeTab.toLowerCase()} movie ticket bookings at the moment.
            </p>
            <Link
              href="/movies"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
            >
              Explore Now Showing Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isCancelled = b.status === "CANCELLED";

              return (
                <div
                  key={b.id}
                  className={`p-4 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 w-full max-w-full min-w-0 ${
                    isCancelled
                      ? "bg-[var(--bg-surface-card)]/50 border-[var(--border-subtle)] opacity-75"
                      : "bg-[var(--bg-surface-card)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                    <div className="relative w-16 aspect-[2/3] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                      <SafeImage
                        src={b.moviePoster}
                        alt={b.movieTitle}
                        type="poster"
                        fallbackTitle={b.movieTitle}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--brand-primary)] text-white">
                          {b.format}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          #{b.id}
                        </span>
                        {isCancelled ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Cancelled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Confirmed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1">{b.movieTitle}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {b.cinemaName} • {b.screenName}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[var(--text-secondary)] mt-2 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          {b.date}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                          {b.startTime}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-white font-bold">
                          Seats: {b.seats.map((s) => s.id).join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                    <div className="text-base font-black text-white mb-3">
                      ₹{b.pricing.totalAmount}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] ml-1">
                        ({b.seats.length} Tickets)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/booking/confirmation/${b.id}`}
                        className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-bold text-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all touch-target"
                      >
                        View Ticket
                      </Link>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(b)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all touch-target"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Booking ID: {cancelModalBooking.id} • {cancelModalBooking.movieTitle}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total Paid:</span>
                <span className="text-white font-bold">₹{cancelModalBooking.pricing.totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Refund Amount (Ticket Subtotal):</span>
                <span className="font-bold">₹{cancelModalBooking.pricing.ticketSubtotal}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)] text-[11px]">
                <span>Non-refundable Convenience Fee & Tax:</span>
                <span>
                  ₹
                  {cancelModalBooking.pricing.totalConvenienceFee +
                    cancelModalBooking.pricing.taxGst}
                </span>
              </div>
            </div>

            {cancelStatusMessage ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
                {cancelStatusMessage}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="py-2.5 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition-all"
                >
                  Confirm Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
