import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 pb-16 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Terms of Service</h1>
        <p className="text-xs text-[var(--text-muted)]">Effective Date: September 2026</p>

        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">1. Introduction</h2>
          <p>
            Welcome to Showara. By accessing our platform and booking cinema tickets, you agree to comply with and be bound by these terms. Showara operates solely as a movie ticket booking platform.
          </p>

          <h2 className="text-sm font-bold text-[var(--text-primary)] pt-2">2. Booking and Seat Allocation</h2>
          <p>
            All ticket bookings are confirmed on an as-available basis. During seat selection, seats are held for a maximum of 8 minutes. If payment is not verified within this window, seats are automatically returned to the public pool.
          </p>

          <h2 className="text-sm font-bold text-[var(--text-primary)] pt-2">3. Admission and Cinema Policies</h2>
          <p>
            Admission to cinema halls is subject to the individual guidelines of the exhibiting theatre (including age certification guidelines such as U, UA, and A ratings). Patrons under the requisite age will not be permitted entry for A-certified films.
          </p>
        </div>
      </div>
    </div>
  );
}
