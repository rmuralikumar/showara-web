"use client";

import React, { useState, useEffect } from "react";
import { useCity } from "@/context/CityContext";
import { Search, MapPin, X, Check } from "lucide-react";

export default function CitySelectorModal() {
  const { currentCity, setCity, isCityModalOpen, closeCityModal, allCities } = useCity();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCityModalOpen) {
        closeCityModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCityModalOpen, closeCityModal]);

  if (!isCityModalOpen) return null;

  const popularCities = allCities.filter((c) => c.isPopular);
  const filteredCities = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={closeCityModal}
    >
      <div
        className="w-full max-w-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 overflow-hidden relative animate-scale-up text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="city-modal-title" className="text-lg font-bold text-[var(--text-primary)] tracking-wide">
                Select Your City
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Cinemas and movie schedules are personalized to your city
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCityModal}
            aria-label="Close City Selector"
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search city or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
            autoFocus
          />
        </div>

        {/* Popular Cities */}
        {!searchTerm && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Popular Cities
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
              {popularCities.map((city) => {
                const isSelected = city.id === currentCity.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setCity(city.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-[var(--brand-primary)]/15 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold shadow-sm"
                        : "bg-[var(--bg-surface-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
                    }`}
                  >
                    <span>{city.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All / Filtered Cities */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {searchTerm ? "Search Results" : "All Cities"}
          </h3>
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredCities.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">
                No cities found matching &quot;{searchTerm}&quot;
              </p>
            ) : (
              filteredCities.map((city) => {
                const isSelected = city.id === currentCity.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setCity(city.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm transition-all ${
                      isSelected
                        ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{city.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">({city.state})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
