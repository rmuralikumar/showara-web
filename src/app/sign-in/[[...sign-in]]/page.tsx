import React, { Suspense } from "react";
import Link from "next/link";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { Film, ShieldCheck, Ticket } from "lucide-react";

export const metadata = {
  title: "Sign In | Showara Cinema Ticket Booking",
  description: "Sign in with Google to view cinema bookings, access digital M-tickets, and book premier cinema seats on Showara.",
};

export default function SignInPage() {
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
              Welcome to Showara
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Sign in with your Google account to book premier cinema tickets and manage reservations.
            </p>
          </div>
        </div>

        {/* Google Authentication Action */}
        <Suspense
          fallback={
            <div className="h-14 flex items-center justify-center text-xs text-[var(--text-muted)]">
              Loading Google Sign In...
            </div>
          }
        >
          <GoogleAuthButton mode="sign-in" redirectUrlComplete="/" />
        </Suspense>

        {/* Feature perks preview */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <Ticket className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
            <span>Instant digital M-tickets &amp; seat reservations</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Fast, secure checkout backed by Google OAuth</span>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="mt-8 text-center text-xs text-[var(--text-muted)] leading-relaxed">
          <span>By continuing, you agree to Showara&apos;s </span>
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
