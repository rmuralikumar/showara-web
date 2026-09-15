"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import {
  CheckCircle2,
  Ticket,
  Printer,
  Share2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Film,
} from "lucide-react";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const resolvedParams = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = bookingService.getBookingById(resolvedParams.bookingId);
    if (found) {
      setBooking(found);
    } else {
      fetch(`/api/bookings/${encodeURIComponent(resolvedParams.bookingId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && data?.booking) {
            setBooking(data.booking);
            bookingService.saveBooking(data.booking);
          }
        })
        .catch(() => {});
    }
  }, [resolvedParams.bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: `Showara Ticket: ${booking.movieTitle}`,
        text: `I've booked ${booking.seats.length} tickets for ${booking.movieTitle} at ${booking.cinemaName}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-main)]">
        <Film className="w-12 h-12 text-[var(--text-muted)] mb-3" />
        <h2 className="text-xl font-bold text-white">Booking Record Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Reference #{resolvedParams.bookingId} could not be retrieved.
        </p>
        <Link
          href="/account/bookings"
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold"
        >
          Go to Booking History
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[var(--bg-main)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Payment Completed Successfully
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Booking Reference ID: <strong className="text-white font-mono">{booking.id}</strong>
          </p>
        </div>

        {/* Digital Boarding-Pass Style Ticket */}
        <div className="relative rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden print:border-black print:text-black print:bg-white">
          {/* Top Brand Header */}
          <div className="p-6 bg-gradient-to-r from-[var(--bg-surface-card)] to-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white font-black text-sm">
                S
              </div>
              <div>
                <div className="text-sm font-black text-white tracking-wider">SHOWARA M-TICKET</div>
                <div className="text-[10px] text-[var(--text-muted)]">Official Digital Admission Pass</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Active Ticket
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="relative w-20 aspect-[2/3] rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                <SafeImage
                  src={booking.moviePoster}
                  alt={booking.movieTitle}
                  type="poster"
                  fallbackTitle={booking.movieTitle}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white mr-2">
                  {booking.format}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {booking.language}
                </span>
                <h2 className="text-xl font-black text-white mt-1 line-clamp-1">
                  {booking.movieTitle}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {booking.cinemaName}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                  {booking.cinemaAddress}
                </p>
              </div>
            </div>

            {/* Timings and Auditorium Details Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Date</span>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">{booking.date}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Time</span>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">{booking.startTime}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Screen</span>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">{booking.screenName}</div>
              </div>
            </div>

            {/* Seats Row */}
            <div className="p-4 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--brand-primary)] block">
                  Confirmed Seats ({booking.seats.length})
                </span>
                <span className="text-xl font-black text-white tracking-wide">
                  {booking.seats.map((s) => s.id).join(", ")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block">Total Paid</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{booking.pricing.totalAmount}
                </span>
              </div>
            </div>

            {/* Visual Barcode & QR Code Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                {/* Simulated High-Res QR code box */}
                <div className="w-20 h-20 bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                  <div className="w-full h-full border-2 border-black grid grid-cols-4 grid-rows-4 gap-0.5 p-1">
                    <div className="bg-black" />
                    <div className="bg-transparent" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-transparent" />
                    <div className="bg-black" />
                    <div className="bg-transparent" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                    <div className="bg-transparent" />
                    <div className="bg-black" />
                    <div className="bg-transparent" />
                    <div className="bg-black" />
                    <div className="bg-black" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Scan at Gate Entry</h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Present this QR code directly on your phone at auditorium entrance.
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                    TXN: {booking.paymentTransactionId}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] font-bold text-white px-2 py-1 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                  Gate Opens: 15 Mins Prior
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Tear-off Notch effect */}
          <div className="p-4 bg-[var(--bg-surface)] border-t border-dashed border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)]">
            A confirmation SMS & Email has been dispatched to {booking.userPhone} • {booking.userEmail}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-bold text-white transition-all touch-target"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-bold text-white transition-all touch-target"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? "Link Copied!" : "Share Ticket"}</span>
          </button>

          <Link
            href="/account/bookings"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-lg shadow-[var(--brand-primary-glow)] hover:brightness-110 active:scale-95 transition-all touch-target"
          >
            <Ticket className="w-4 h-4" />
            <span>View in Booking History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
