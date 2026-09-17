"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCity } from "@/context/CityContext";
import {
  Search,
  MapPin,
  X,
  Check,
  Navigation,
  Loader2,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { City } from "@/types/cinema";

export default function CitySelectorModal() {
  const {
    currentCity,
    setCity,
    isCityModalOpen,
    closeCityModal,
    allCities,
    findNearestCity,
  } = useCity();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedCityName, setDetectedCityName] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCityModalOpen) {
        closeCityModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCityModalOpen, closeCityModal]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isCityModalOpen) {
      setSearchTerm("");
      setIsDetectingLocation(false);
      setLocationError(null);
      setDetectedCityName(null);
    }
  }, [isCityModalOpen]);

  // Popular cities
  const popularCities = useMemo(() => {
    return allCities.filter((c) => c.isPopular);
  }, [allCities]);

  // Normalized search matching
  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return allCities;

    // Check if user entered numbers (pincode search)
    const isNumeric = /^\d+$/.test(query);

    return allCities
      .map((city) => {
        let matchScore = 0;
        let matchReason = "";

        const nameLower = city.name.toLowerCase();
        const stateLower = city.state.toLowerCase();
        const aliases = city.aliases || [];
        const pincodes = city.pincodes || [];
        const theatreLocations = city.theatreLocations || [];

        // Exact name match
        if (nameLower === query) {
          matchScore += 100;
        } else if (nameLower.startsWith(query)) {
          matchScore += 50;
        } else if (nameLower.includes(query)) {
          matchScore += 30;
        }

        // Pincode search
        if (isNumeric) {
          const matchedPin = pincodes.find((p) => p.startsWith(query) || query.startsWith(p));
          if (matchedPin) {
            matchScore += 80;
            matchReason = `PIN: ${matchedPin}`;
          }
        }

        // Aliases (e.g. Bangalore for Bengaluru, Bombay for Mumbai, Gurgaon for Delhi-NCR, etc.)
        const matchedAlias = aliases.find((alias) =>
          alias.toLowerCase().includes(query)
        );
        if (matchedAlias) {
          matchScore += 45;
          if (!matchReason) matchReason = `Also known as ${matchedAlias}`;
        }

        // Theatre Locations / Localities (e.g. Koramangala, Bandra, Connaught Place, Hitec City, etc.)
        const matchedLoc = theatreLocations.find((loc) =>
          loc.toLowerCase().includes(query)
        );
        if (matchedLoc) {
          matchScore += 40;
          if (!matchReason) matchReason = `Near ${matchedLoc}`;
        }

        // State name match
        if (stateLower.includes(query)) {
          matchScore += 20;
          if (!matchReason) matchReason = `${city.state}`;
        }

        return {
          city,
          score: matchScore,
          matchReason,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name));
  }, [allCities, searchTerm]);

  // Handle "Use my current location"
  const handleUseCurrentLocation = () => {
    setLocationError(null);
    setDetectedCityName(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestCity(latitude, longitude);

        setIsDetectingLocation(false);
        setDetectedCityName(nearest.name);

        // Select and save the city
        setTimeout(() => {
          setCity(nearest.id);
        }, 500);
      },
      (error) => {
        setIsDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please select your city manually below.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is currently unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please choose manually.");
            break;
          default:
            setLocationError("Unable to detect location. Please choose from the list.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  if (!isCityModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pl-safe pr-safe pt-safe pb-safe bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeCityModal}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--border-subtle)] flex-shrink-0 bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2
                  id="city-modal-title"
                  className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-wide truncate"
                >
                  Select Your City
                </h2>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  Personalize cinemas, movies & showtimes across India
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCityModal}
              aria-label="Close City Selector"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors shrink-0 touch-target"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Bar with Pincode and Area support */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search city, state, area, or pincode (e.g. 560001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all shadow-inner"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar p-4 sm:p-6 space-y-5">
          {/* Location Detection Button & Status */}
          <div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 hover:bg-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/50 transition-all group touch-target text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] group-hover:scale-105 transition-transform">
                  {isDetectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
                  ) : (
                    <Navigation className="w-4 h-4 text-[var(--brand-primary)]" />
                  )}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block group-hover:text-[var(--brand-primary)] transition-colors">
                    {isDetectingLocation
                      ? "Detecting your location..."
                      : detectedCityName
                      ? `Detected: ${detectedCityName}`
                      : "Use my current location"}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {detectedCityName
                      ? "Applying nearest city..."
                      : "Find cinemas and showtimes nearest to you using GPS"}
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold text-[var(--brand-primary)] shrink-0 hidden sm:inline">
                {isDetectingLocation ? "Detecting..." : "Detect"}
              </span>
            </button>

            {/* Geolocation Feedback Message */}
            {locationError && (
              <div className="flex items-start gap-2 mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          {/* Popular Cities Grid (When not searching) */}
          {!searchTerm && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                  <span>Popular Cities</span>
                </h3>
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  {popularCities.length} Metros
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {popularCities.map((city) => {
                  const isSelected = city.id === currentCity.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setCity(city.id)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left touch-target min-w-0 ${
                        isSelected
                          ? "bg-[var(--brand-primary)]/15 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]"
                          : "bg-[var(--bg-surface-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
                      }`}
                    >
                      <span className="truncate pr-1">{city.name}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)] uppercase shrink-0 font-semibold">
                          {city.state.slice(0, 2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Cities / Search Results */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>{searchTerm ? "Search Results" : "All Cities & Locations"}</span>
              </h3>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                {searchTerm
                  ? `${searchResults.length} matching`
                  : `${allCities.length} locations across India`}
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-8 px-4 text-center bg-[var(--bg-surface-card)] rounded-2xl border border-[var(--border-subtle)] space-y-3">
                <MapPin className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    No cities found matching &quot;{searchTerm}&quot;
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Try searching by state name, 6-digit pincode, or pick one of the major metros below.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  {popularCities.slice(0, 4).map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCity(city.id);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--brand-primary)]/20 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-all font-medium"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {searchResults.map((item) => {
                  const city = "city" in item ? item.city : (item as City);
                  const matchReason = "matchReason" in item ? item.matchReason : "";
                  const isSelected = city.id === currentCity.id;

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setCity(city.id)}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm transition-all text-left border ${
                        isSelected
                          ? "bg-[var(--brand-primary)]/15 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold shadow-sm"
                          : "bg-[var(--bg-surface-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? "text-[var(--brand-primary)]" : "text-[var(--text-muted)]"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[var(--text-primary)] truncate">
                              {city.name}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              ({city.state})
                            </span>
                            {city.isPopular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] uppercase">
                                Metro
                              </span>
                            )}
                          </div>

                          {/* Matching detail badge / hint */}
                          {matchReason && (
                            <span className="text-[10px] text-[var(--brand-primary)] font-medium block truncate mt-0.5">
                              {matchReason}
                            </span>
                          )}

                          {/* Prominent Theatre Hubs Preview if no specific search reason */}
                          {!matchReason && city.theatreLocations && city.theatreLocations.length > 0 && (
                            <span className="text-[10px] text-[var(--text-muted)] truncate block mt-0.5">
                              {city.theatreLocations.slice(0, 3).join(" • ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with current selection */}
        <div className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs text-[var(--text-muted)] flex-shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span>Current:</span>
            <strong className="text-[var(--text-primary)] truncate">{currentCity.name}</strong>
            <span className="text-[10px] text-[var(--text-muted)]">({currentCity.state})</span>
          </div>
          <button
            type="button"
            onClick={closeCityModal}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline shrink-0 ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
