"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CITIES } from "@/data/cities";
import { City } from "@/types/cinema";

interface CityContextType {
  currentCity: City;
  setCity: (cityId: string) => void;
  isCityModalOpen: boolean;
  openCityModal: () => void;
  closeCityModal: () => void;
  allCities: City[];
  findNearestCity: (lat: number, lng: number) => City;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState<City>(CITIES[0]); // default Bengaluru
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("showara_selected_city");
    if (saved) {
      const found = CITIES.find((c) => c.id === saved || c.slug === saved);
      if (found) setCurrentCity(found);
    }
  }, []);

  const setCity = (cityId: string) => {
    const found = CITIES.find((c) => c.id === cityId || c.slug === cityId);
    if (found) {
      setCurrentCity(found);
      localStorage.setItem("showara_selected_city", found.id);
      setIsCityModalOpen(false);
    }
  };

  const findNearestCity = (lat: number, lng: number): City => {
    let nearest = CITIES[0];
    let minDistance = Infinity;

    for (const city of CITIES) {
      if (city.latitude !== undefined && city.longitude !== undefined) {
        const dist = getDistanceKm(lat, lng, city.latitude, city.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = city;
        }
      }
    }

    return nearest;
  };

  return (
    <CityContext.Provider
      value={{
        currentCity,
        setCity,
        isCityModalOpen,
        openCityModal: () => setIsCityModalOpen(true),
        closeCityModal: () => setIsCityModalOpen(false),
        allCities: CITIES,
        findNearestCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
