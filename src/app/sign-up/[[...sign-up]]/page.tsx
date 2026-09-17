import React, { Suspense } from "react";
import Link from "next/link";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Film, ShieldCheck, Ticket, Sparkles } from "lucide-react";

export const metadata = {
  title: "Sign Up | Showara Cinema Ticket Booking",
  description: "Create your Showara account with Google for instant ticket booking, cinema discounts, and premiere invitations.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pl-safe pr-safe pb-safe bg-[var(--bg-main)]">
      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-2xl transition-all">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-lg shadow-[var(--brand-primary-glow)] mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Join Showara Cinema
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Create an account with Google for fast checkout, digital M-tickets, and exclusive screenings.
            </p>
          </div>
        </div>

        {/* Google Authentication Action */}
        <Suspense
          fallback={
            <div className="h-14 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Loading Google Sign Up...
            </div>
          }
        >
          <GoogleAuthButton mode="sign-up" redirectUrlComplete="/" />
        </Suspense>

        {/* Club Perks */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Automatic Showara Cinema Club membership</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <Ticket className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
            <span>Real-time ticket tracking &amp; barcode access</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>One-click Google authentication</span>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="mt-8 text-center text-xs text-[var(--text-muted)] leading-relaxed">
          <span>By signing up, you agree to Showara&apos;s </span>
          <Link href="/help/terms" className="text-[var(--brand-primary)] hover:underline font-semibold">
            Terms of Service
          </Link>
          <span> &amp; </span>
          <Link href="/help/privacy" className="text-[var(--brand-primary)] hover:underline font-semibold">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
