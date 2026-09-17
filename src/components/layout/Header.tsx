"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCity } from "@/context/CityContext";
import { useAuth } from "@/context/AuthContext";
import CitySelectorModal from "./CitySelectorModal";
import ThemeToggle from "@/components/common/ThemeToggle";
import {
  Film,
  MapPin,
  ChevronDown,
  Search,
  Ticket,
  User,
  Clapperboard,
  LogOut,
  Settings,
} from "lucide-react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentCity, openCityModal } = useCity();
  const { user, isSignedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const navLinks = [
    { name: "Movies", href: "/movies", icon: Film },
    { name: "Cinemas", href: "/cinemas", icon: Clapperboard },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-main)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors overflow-x-clip pt-safe">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pl-safe pr-safe h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2.5 group outline-none flex-shrink-0"
              aria-label="Showara Home"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo-icon-128.png"
                  alt="Showara"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                />
              </div>
              <div className="flex flex-col flex-shrink-0">
                <span className="text-sm sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-0.5 whitespace-nowrap">
                  <span>Show</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8533] to-[#ff2a5f]">ara</span>
                  {/* Accessibility and test suite compatibility */}
                  <span className="sr-only">SHOWARA</span>
                </span>
                <span className="text-[8px] sm:text-[8.5px] font-semibold tracking-wider text-[var(--text-muted)] -mt-0.5 uppercase hidden sm:block">
                  Book Movie Tickets Online
                </span>
              </div>
            </Link>

            {/* City Selector Button with explicit min-height, horizontal padding, and non-collapsing text */}
            <button
              type="button"
              onClick={openCityModal}
              className="min-h-[36px] h-9 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all touch-target flex-shrink-0 shadow-sm"
              aria-label={`Current city: ${currentCity.name}. Click to change.`}
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)] flex-shrink-0" />
              <span className="font-semibold text-[var(--text-primary)] text-xs truncate min-w-[44px] max-w-[65px] sm:max-w-[130px] flex-shrink-0">
                {currentCity.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, languages, or cinemas..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
              />
            </form>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {/* Mobile Search button */}
            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden p-1.5 sm:p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors touch-target flex items-center justify-center flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bookings Link (Desktop) - Only for authenticated users */}
            {isSignedIn && (
              <Link
                href="/account/bookings"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all flex-shrink-0"
              >
                <Ticket className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Bookings</span>
              </Link>
            )}

            {/* Theme Toggle (Desktop & Mobile) */}
            <ThemeToggle variant="dropdown" />

            {/* User Account / Profile */}
            {!isSignedIn ? (
              <GoogleAuthButton variant="navbar" />
            ) : (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                  aria-expanded={isProfileMenuOpen}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all touch-target shadow-sm flex-shrink-0"
                >
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline font-bold text-[var(--text-primary)] max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                        {user.email || "Showara Member"}
                      </p>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-0.5">
                      <Link
                        href="/account/bookings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-card)] transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-card)] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-card)] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="my-1 border-t border-[var(--border-subtle)]" />

                    {/* Sign Out Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* City Selector Modal Dialog */}
      <CitySelectorModal />
    </>
  );
}
