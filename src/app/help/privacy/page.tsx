import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-muted)]">Last Updated: September 2026</p>

        <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)]">
          <h2 className="text-sm font-bold text-white">1. Data We Collect</h2>
          <p>
            Showara collects your name, phone number, and email address solely for delivering your digital cinema admission pass (M-Ticket) and transactional SMS notifications.
          </p>

          <h2 className="text-sm font-bold text-white pt-2">2. Payment Security</h2>
          <p>
            We do not store raw card numbers, CVVs, or banking credentials on our servers. All transactions are securely routed through certified payment processing gateways.
          </p>

          <h2 className="text-sm font-bold text-white pt-2">3. Zero Third-Party Advertising</h2>
          <p>
            Showara does not sell or rent your personal information to third-party ad networks or marketing agencies.
          </p>
        </div>
      </div>
    </div>
  );
}
