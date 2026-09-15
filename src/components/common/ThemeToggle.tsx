"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "@/context/ThemeContext";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  variant?: "dropdown" | "segmented";
  className?: string;
}

export default function ThemeToggle({
  variant = "dropdown",
  className = "",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  // Segmented Pill Variant (e.g. for Account settings)
  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Theme Selection"
        className={`inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface-card)] border border-[var(--border-subtle)] ${className}`}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all touch-target ${
                isSelected
                  ? "bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary-glow)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown Variant (e.g. for Header)
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        aria-expanded={isOpen}
        className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all touch-target flex items-center justify-center shadow-sm"
      >
        <CurrentIcon className="w-4 h-4 text-[var(--brand-primary)]" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          className="absolute right-0 mt-2 w-36 py-1.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-2xl z-50 animate-scale-up"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1">
            Theme
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "text-[var(--brand-primary)] font-bold bg-[var(--brand-primary)]/10"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
