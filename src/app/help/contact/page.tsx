"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            Help & Support
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Get in Touch with Showara
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            We are here to assist with bookings, cinema admission, and refund queries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Email Support</h3>
                  <p className="text-xs text-[var(--text-muted)]">support@showara.internal</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Helpline (Toll-Free)</h3>
                  <p className="text-xs text-[var(--text-muted)]">1800-419-SHOW (7 AM - 11 PM)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Headquarters</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Showara Media Center, 80 Feet Road, Koramangala, Bengaluru - 560034
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Received</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Our customer support team will reply to your registered email address within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-white mb-2">Send us a message</h3>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
                    placeholder="Describe your inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
