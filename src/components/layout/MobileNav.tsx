"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Home, Film, Clapperboard, Ticket, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  // Hide mobile nav during seat selection or active payment to prevent distraction / accidental navigation
  const isBookingFunnel =
    pathname.startsWith("/book/") ||
    pathname.startsWith("/booking/payment") ||
    pathname.startsWith("/booking/review");

  if (isBookingFunnel) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home, exact: true },
    { label: "Movies", href: "/movies", icon: Film, exact: false },
    { label: "Cinemas", href: "/cinemas", icon: Clapperboard, exact: false },
    { label: "Bookings", href: "/account/bookings", icon: Ticket, exact: false },
    { label: "Profile", href: "/account", icon: User, exact: true },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface-elevated)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] pb-safe pl-safe pr-safe shadow-2xl"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={!isSignedIn && (item.href === "/account" || item.href === "/account/bookings") ? "/sign-in" : item.href}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center h-full touch-target transition-all ${
                isActive
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110" : ""
                  }`}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight font-medium ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
