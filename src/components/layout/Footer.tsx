import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, ShieldCheck, Clock, Award, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] pb-20 md:pb-6 pb-safe">
      {/* Brand Values Banner */}
      <div className="border-b border-[var(--border-subtle)] py-8 px-4 sm:px-6 lg:px-8 pl-safe pr-safe">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">100% Authentic Tickets</h4>
              <p className="text-xs text-[var(--text-muted)]">Official cinema partner with instant confirmation</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Easy Cancellation</h4>
              <p className="text-xs text-[var(--text-muted)]">Cancel up to 20 mins before showtime for eligible screens</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Best Seat Selection</h4>
              <p className="text-xs text-[var(--text-muted)]">Live interactive seating with 8-min hold guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo-icon-128.png"
                  alt="Showara"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center">
                  <span>Show</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8533] to-[#ff2a5f]">ara</span>
                  <span className="sr-only">SHOWARA</span>
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-[var(--text-muted)] -mt-0.5 uppercase">
                  Book Movie Tickets Online
                </span>
              </div>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mb-4">
              Showara is an exclusive movie discovery and cinema ticket booking platform.
              Crafted for cinema lovers seeking a seamless, modern, and transparent booking experience.
            </p>
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-[var(--brand-primary)] fill-[var(--brand-primary)]" />
              <span>for cinema enthusiasts</span>
            </div>

            {/* Official TMDB Attribution */}
            <div className="mt-5 p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] max-w-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-1.5 py-0.5 rounded bg-[#0d253f] text-[#01b4e4] font-black text-[11px] tracking-wider">
                  TMDB
                </span>
                <span className="text-[11px] font-bold text-[var(--text-primary)]">
                  Data & Media Partner
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-normal">
                This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata, posters, and cast images provided by The Movie Database.
              </p>
            </div>
          </div>

          {/* Movies Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/movies?status=now_showing" className="hover:text-[var(--text-primary)] transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link href="/movies?status=upcoming" className="hover:text-[var(--text-primary)] transition-colors">
                  Upcoming Movies
                </Link>
              </li>
              <li>
                <Link href="/movies/a-z" className="hover:text-[var(--text-primary)] transition-colors font-medium text-[var(--brand-primary)]">
                  A–Z Movie Directory
                </Link>
              </li>
              <li>
                <Link href="/movies?format=IMAX 2D" className="hover:text-[var(--text-primary)] transition-colors">
                  IMAX Experiences
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="hover:text-[var(--text-primary)] transition-colors">
                  Browse Cinemas
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Account
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account/bookings" className="hover:text-[var(--text-primary)] transition-colors">
                  Booking History
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[var(--text-primary)] transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/account/cancellation" className="hover:text-[var(--text-primary)] transition-colors">
                  Cancel Ticket
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3">
              Help & Policies
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/help/cancellation" className="hover:text-[var(--text-primary)] transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/help/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/help/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Support & FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Showara Entertainment Technologies Inc. All rights reserved.</p>
          <p className="text-[11px]">
            Showara is an independent cinema booking platform. All cinema and film trademarks belong to their respective creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
