"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import {
  User,
  Ticket,
  Mail,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle2,
  Palette,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync state when user profile loads or changes
  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    try {
      const parts = name.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      await updateProfile({ firstName, lastName });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-10 pb-16 pb-safe bg-[var(--bg-main)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pl-safe pr-safe space-y-6 sm:space-y-8">
        {/* Profile Card Header */}
        <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={name || "User Avatar"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-[var(--border-strong)] flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[var(--brand-primary-glow)] flex-shrink-0">
              {name ? name[0].toUpperCase() : "U"}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {name || "Moviegoer"}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Google Account</span>
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 break-all">
              <span>Member ID: {user.id}</span>
              <span className="hidden sm:inline">•</span>
              <span>Showara Cinema Club</span>
              {user.email && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-semibold text-[var(--text-primary)] break-all">{user.email}</span>
                </>
              )}
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
                href="/movies"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all touch-target shadow-sm"
              >
                <span>Browse Movies</span>
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
              <h2 className="text-base font-bold text-[var(--text-primary)]">Account Profile Details</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Google account profile details synchronized via Google OAuth
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile updated</span>
              </span>
            )}
          </div>

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
              {saveError}
            </div>
          )}

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
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1.5 font-medium flex items-center justify-between">
                  <span>Verified Google Email</span>
                  <span className="text-[10px] text-emerald-500 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Google Verified
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="email"
                    readOnly
                    value={user.email || "Google Account Connected"}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface-elevated)]/60 border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-semibold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[10px] text-[var(--text-muted)]">
                Name changes are synchronized to your Showara profile.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:brightness-105 active:scale-95 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all touch-target"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
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

        {/* Sign Out Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface-card)] border border-rose-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Sign Out of Showara</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Securely end your active Google session on this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all border border-rose-500/20 touch-target"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
