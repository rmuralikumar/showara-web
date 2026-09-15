"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "showara_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Helper to apply class on <html>
  const applyThemeClass = (isDark: boolean) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const initial = saved || "system";
      setThemeState(initial);

      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const isSystemDark = media.matches;
      const effectiveTheme: ResolvedTheme =
        initial === "system" ? (isSystemDark ? "dark" : "light") : initial;

      setResolvedTheme(effectiveTheme);
      applyThemeClass(effectiveTheme === "dark");

      // Listen for OS system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        const currentSaved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (!currentSaved || currentSaved === "system") {
          const newResolved: ResolvedTheme = e.matches ? "dark" : "light";
          setResolvedTheme(newResolved);
          applyThemeClass(newResolved === "dark");
        }
      };

      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    } catch {
      // fallback to dark
      setResolvedTheme("dark");
      applyThemeClass(true);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // storage disabled
    }

    let effective: ResolvedTheme;
    if (newTheme === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effective = isSystemDark ? "dark" : "light";
    } else {
      effective = newTheme;
    }

    setResolvedTheme(effective);
    applyThemeClass(effective === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
