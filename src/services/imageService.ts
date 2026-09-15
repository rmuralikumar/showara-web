/**
 * SHOWARA IMAGE URL SERVICE
 * Centralized service for TMDB image URL resolution and graceful fallback handling.
 */

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type PosterSize = "w185" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";
export type ProfileSize = "w45" | "w185" | "h632" | "original";
export type LogoSize = "w92" | "w154" | "w185" | "w300" | "w500" | "original";

/**
 * Clean and SVG-encoded original Showara placeholders
 */
export function getFallbackPoster(title: string = "Showara Movie"): string {
  const safeTitle = (title || "Showara Movie").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750" fill="none">
    <rect width="500" height="750" fill="#0c101c"/>
    <rect x="2" y="2" width="496" height="746" rx="20" stroke="#1e263d" stroke-width="4"/>
    <circle cx="250" cy="300" r="70" fill="#181d2e" stroke="#2a334d" stroke-width="2"/>
    <path d="M230 270L285 300L230 330V270Z" fill="#ff2a5f"/>
    <text x="250" y="440" text-anchor="middle" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800">${safeTitle}</text>
    <text x="250" y="475" text-anchor="middle" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600">SHOWARA CINEMA ARCHIVE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getFallbackBackdrop(title: string = "Showara Featured"): string {
  const safeTitle = (title || "Showara Featured").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
    <rect width="1280" height="720" fill="#07090e"/>
    <circle cx="640" cy="360" r="180" fill="#ff2a5f" fill-opacity="0.08"/>
    <path d="M600 300L720 360L600 420V300Z" fill="#ff2a5f" fill-opacity="0.5"/>
    <text x="640" y="500" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="24" font-weight="700">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getFallbackPerson(name: string = "Cast Member"): string {
  const safeName = name || "Cast Member";
  const initial = (safeName[0] || "A").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none">
    <rect width="300" height="300" fill="#181d2e"/>
    <circle cx="150" cy="150" r="140" stroke="#2a334d" stroke-width="2"/>
    <text x="150" y="175" text-anchor="middle" fill="#ff2a5f" font-family="system-ui, sans-serif" font-size="80" font-weight="800">${initial}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getFallbackLogo(title: string = "Showara"): string {
  const safeTitle = (title || "Showara").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100" fill="none">
    <rect width="300" height="100" rx="12" fill="#0c101c"/>
    <text x="150" y="58" text-anchor="middle" fill="#ff2a5f" font-family="system-ui, sans-serif" font-size="28" font-weight="900" letter-spacing="2">${safeTitle.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Validates whether a path or URL is a non-empty, non-malformed image path
 */
export function isValidImagePath(pathOrUrl: string | null | undefined): boolean {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return false;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower === "undefined" ||
    lower === "null" ||
    lower === "nan" ||
    lower === "none" ||
    lower === "/" ||
    lower === "//"
  ) {
    return false;
  }

  // If already a full URL, check for /undefined or /null at the end of path
  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    if (lower.includes("/undefined") || lower.includes("/null")) return false;
    return true;
  }

  // Inline data URL
  if (lower.startsWith("data:image/")) return true;

  // Clean relative path checks
  const clean = trimmed.replace(/^\/+/, "");
  const cleanLower = clean.toLowerCase();
  if (
    !clean ||
    cleanLower === "undefined" ||
    cleanLower === "null" ||
    cleanLower.startsWith("undefined") ||
    cleanLower.startsWith("null")
  ) {
    return false;
  }

  return true;
}

/**
 * Normalizes a relative TMDB path or returns existing valid URL
 */
function normalizeTmdbPath(pathOrUrl: string, size: string): string | null {
  if (!isValidImagePath(pathOrUrl)) return null;

  const trimmed = pathOrUrl.trim();

  // If already absolute URL or data URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Strip multiple leading slashes and guarantee clean structure
  const clean = trimmed.replace(/^\/+/, "");
  return `${TMDB_IMAGE_BASE}/${size}/${clean}`;
}

export const imageService = {
  isValidImagePath,
  getFallbackPoster,
  getFallbackBackdrop,
  getFallbackPerson,
  getFallbackLogo,

  /**
   * Resolves TMDB poster path or full URL, falling back to clean original placeholder
   */
  getPosterUrl: (pathOrUrl: string | null | undefined, size: PosterSize = "w500", fallbackTitle?: string): string => {
    if (!pathOrUrl) return getFallbackPoster(fallbackTitle);
    const resolved = normalizeTmdbPath(pathOrUrl, size);
    return resolved || getFallbackPoster(fallbackTitle);
  },

  /**
   * Resolves TMDB backdrop path or full URL
   */
  getBackdropUrl: (pathOrUrl: string | null | undefined, size: BackdropSize = "original", fallbackTitle?: string): string => {
    if (!pathOrUrl) return getFallbackBackdrop(fallbackTitle);
    const resolved = normalizeTmdbPath(pathOrUrl, size);
    return resolved || getFallbackBackdrop(fallbackTitle);
  },

  /**
   * Resolves TMDB person/actor profile image URL
   */
  getProfileUrl: (pathOrUrl: string | null | undefined, size: ProfileSize = "w185", fallbackName?: string): string => {
    if (!pathOrUrl) return getFallbackPerson(fallbackName);
    const resolved = normalizeTmdbPath(pathOrUrl, size);
    return resolved || getFallbackPerson(fallbackName);
  },

  /**
   * Resolves movie logo URL if present
   */
  getLogoUrl: (pathOrUrl: string | null | undefined, size: LogoSize = "w300", fallbackTitle?: string): string | null => {
    if (!pathOrUrl) return fallbackTitle ? getFallbackLogo(fallbackTitle) : null;
    const resolved = normalizeTmdbPath(pathOrUrl, size);
    return resolved || (fallbackTitle ? getFallbackLogo(fallbackTitle) : null);
  },
};
