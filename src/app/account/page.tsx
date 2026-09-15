"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import {
  User,
  Ticket,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  LogOut,
  Save,
  CheckCircle2,
  Palette,
} from "lucide-react";

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen py-10 bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[var(--brand-primary-glow)]">
            {name ? name[0] : "U"}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-[var(--text-primary)]">{name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                Verified Member
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span>Member ID: {user.id}</span>
              <span>•</span>
              <span>Showara Cinema Club</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              <Link
                href="/account/bookings"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-xs font-bold text-[var(--text-primary)] transition-all touch-target shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>My Bookings</span>
              </Link>
              <Link
                href="/cinemas"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all touch-target shadow-sm"
              >
                <span>Browse Cinemas</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Theme Preferences Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--brand-primary)]" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">Theme Preference</h2>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Choose between Light, Dark, or System mode. System mode automatically matches your device settings.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Personal Information</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Update your contact details for ticket SMS and booking notifications
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile updated</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all touch-target"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Account Security & Support Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Ticket Cancellation Policy</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Learn about cancellation cut-off times and instant refund timelines for your tickets.
            </p>
            <Link
              href="/help/cancellation"
              className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
            >
              View Cancellation Policy →
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Customer Support</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Need assistance with your booking or cinema admission? We are here to help.
            </p>
            <Link
              href="/help/contact"
              className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
