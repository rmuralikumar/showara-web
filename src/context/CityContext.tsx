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
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState<City>(CITIES[0]); // default Bengaluru
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("showara_selected_city");
    if (saved) {
      const found = CITIES.find((c) => c.id === saved);
      if (found) setCurrentCity(found);
    }
  }, []);

  const setCity = (cityId: string) => {
    const found = CITIES.find((c) => c.id === cityId);
    if (found) {
      setCurrentCity(found);
      localStorage.setItem("showara_selected_city", found.id);
      setIsCityModalOpen(false);
    }
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
