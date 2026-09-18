"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Booking } from "@/types/booking";
import { QrCode, Maximize2, X, Check, Copy, Download } from "lucide-react";

interface TicketQRCodeProps {
  booking: Booking;
  size?: number;
  className?: string;
}

export default function TicketQRCode({
  booking,
  size = 88,
  className = "",
}: TicketQRCodeProps) {
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct comprehensive machine-scannable ticket payload
  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://showara.com";

  const ticketPayload = JSON.stringify({
    app: "SHOWARA",
    id: booking.id,
    movie: booking.movieTitle,
    cinema: booking.cinemaName,
    screen: booking.screenName,
    date: booking.date,
    time: booking.startTime,
    seats: booking.seats.map((s) => s.id),
    total: booking.pricing.totalAmount,
    txn: booking.paymentTransactionId || "",
    verifyUrl: `${origin}/booking/confirmation/${booking.id}`,
  });

  useEffect(() => {
    let isCancelled = false;

    // Generate crisp vector SVG
    QRCode.toString(ticketPayload, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((svg) => {
        if (!isCancelled) setSvgMarkup(svg);
      })
      .catch((err) => {
        console.error("Failed to generate ticket QR SVG:", err);
      });

    // Generate high-resolution PNG data URL for download / fallback
    QRCode.toDataURL(ticketPayload, {
      margin: 1,
      width: 512,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (!isCancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error("Failed to generate ticket QR DataURL:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [ticketPayload]);

  const handleCopyTicketData = () => {
    navigator.clipboard.writeText(ticketPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `showara-ticket-${booking.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      {/* Ticket QR Display Box */}
      <div
        className={`relative group cursor-pointer flex-shrink-0 bg-white p-2 rounded-2xl shadow-md border border-neutral-200 transition-all hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-[var(--brand-primary)] ${className}`}
        style={{ width: size, height: size }}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Enlarge scannable QR code for ticket #${booking.id}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        {svgMarkup ? (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-xl animate-pulse">
            <QrCode className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
        </div>
      </div>

      {/* High-Resolution Gate Scanner Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High Resolution Admission QR Code"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-center animate-in zoom-in-95 duration-200 pl-safe pr-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close QR Modal"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-card)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pt-1 sm:pt-0">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Official Admission Gate Pass
              </span>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1.5 sm:mt-2">
                {booking.movieTitle}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {booking.cinemaName} • {booking.screenName}
              </p>
            </div>

            {/* Centered High-Contrast Ultra-Sharp QR Box */}
            <div className="w-48 h-48 sm:w-60 sm:h-60 mx-auto bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-neutral-200 flex items-center justify-center">
              {svgMarkup ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              ) : (
                <QrCode className="w-12 h-12 text-neutral-400 animate-spin" />
              )}
            </div>

            {/* Ticket Info Card */}
            <div className="p-3 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs">
              <div className="text-left">
                <span className="text-[10px] text-[var(--text-muted)] block">Booking ID</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{booking.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block">Seats</span>
                <span className="font-bold text-[var(--brand-primary)]">
                  {booking.seats.map((s) => s.id).join(", ")}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[var(--text-muted)] block">Date & Time</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {booking.date} • {booking.startTime}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block">Status</span>
                <span className="font-bold text-emerald-400">CONFIRMED</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all shadow-md touch-target"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Image</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTicketData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all touch-target"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
