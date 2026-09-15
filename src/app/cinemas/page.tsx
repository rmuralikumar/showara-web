"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CINEMAS } from "@/data/cinemas";
import { useCity } from "@/context/CityContext";
import {
  MapPin,
  Search,
  ChevronRight,
  ShieldCheck,
  Clapperboard,
  Sparkles,
} from "lucide-react";

export default function CinemasPage() {
  const { currentCity, openCityModal } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFacility, setFilterFacility] = useState("All");

  const facilities = [
    "All",
    "IMAX with Laser",
    "Dolby Atmos",
    "Recliner Seats",
    "4DX",
    "Wheelchair Accessible",
  ];

  const cityCinemas = CINEMAS.filter((c) => c.cityId === currentCity.id);

  const filteredCinemas = cityCinemas.filter((cinema) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (
        !cinema.name.toLowerCase().includes(q) &&
        !cinema.area.toLowerCase().includes(q) &&
        !cinema.address.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (filterFacility !== "All") {
      if (!cinema.facilities.includes(filterFacility as any)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen py-8 bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Cinemas in {currentCity.name}
              </h1>
              <button
                type="button"
                onClick={openCityModal}
                className="text-xs font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-full hover:bg-[var(--brand-primary)]/20 transition-colors"
              >
                Change City
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Find premier movie theatres, IMAX auditoriums, and showtimes near you
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cinema or locality..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
            />
          </div>
        </div>

        {/* Facilities Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
          {facilities.map((fac) => (
            <button
              key={fac}
              type="button"
              onClick={() => setFilterFacility(fac)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterFacility === fac
                  ? "bg-[var(--brand-primary)] text-white font-bold shadow-sm"
                  : "bg-[var(--bg-surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {fac}
            </button>
          ))}
        </div>

        {/* Cinemas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredCinemas.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <Clapperboard className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">No cinemas match your search</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Try switching city or changing facility filters.
              </p>
            </div>
          ) : (
            filteredCinemas.map((cinema) => (
              <div
                key={cinema.id}
                className="p-6 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                      {cinema.area}
                    </span>
                    {cinema.cancellationAllowed && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>M-Ticket / Easy Cancellation</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-1">{cinema.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {cinema.address}
                  </p>

                  {/* Screens badge */}
                  <div className="flex items-center gap-2 mt-4 text-xs text-[var(--text-secondary)]">
                    <Clapperboard className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{cinema.screens.length} Auditoriums</span>
                    <span>•</span>
                    <span>{cinema.screens.map((s) => s.format).join(", ")}</span>
                  </div>

                  {/* Facilities */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cinema.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">
                    {cinema.phone || "Official Cinema Partner"}
                  </span>
                  <Link
                    href={`/cinemas/${cinema.slug}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all touch-target"
                  >
                    <span>View Showtimes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
