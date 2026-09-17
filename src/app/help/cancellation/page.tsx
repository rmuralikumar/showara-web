import React from "react";
import Link from "next/link";
import { ShieldCheck, Clock, RefreshCw, AlertCircle, ChevronLeft } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 pb-16 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div>
          <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            Showara Guarantees
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Ticket Cancellation & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Transparent rules for hassle-free ticket cancellation across our cinema network.
          </p>
        </div>

        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>1. Cancellation Timelines</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Ticket cancellations are supported up to <strong>20 minutes prior</strong> to the scheduled showtime for cinemas marked with the &quot;Cancellation Available&quot; badge.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>2. Refund Calculations</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              When an eligible booking is cancelled, <strong>100% of the ticket base price</strong> is credited back to the original source of payment (UPI, Credit/Debit Card, or Net Banking).
              As per industry standard cinema operations, convenience fees and applicable GST are non-refundable.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>3. Processing Timeline</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              UPI refunds are processed instantly or within 2-4 hours. Card refunds reflect within 3 to 5 banking working days depending on your issuing bank.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/account/bookings"
            className="px-6 py-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 inline-block"
          >
            Manage Your Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
