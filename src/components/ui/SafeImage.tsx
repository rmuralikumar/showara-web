"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import {
  imageService,
  getFallbackPoster,
  getFallbackBackdrop,
  getFallbackPerson,
  getFallbackLogo,
} from "@/services/imageService";

export type ImageFallbackType = "poster" | "backdrop" | "profile" | "logo" | "general";

export interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string | null | undefined;
  alt: string;
  type?: ImageFallbackType;
  fallbackType?: ImageFallbackType;
  fallbackTitle?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Returns the appropriate SVG fallback based on image type
 */
function getFallbackForType(type: ImageFallbackType, title: string): string {
  switch (type) {
    case "backdrop":
      return getFallbackBackdrop(title);
    case "profile":
      return getFallbackPerson(title);
    case "logo":
      return getFallbackLogo(title);
    case "poster":
    case "general":
    default:
      return getFallbackPoster(title);
  }
}

/**
 * Resolves the initial image source or returns the SVG fallback
 */
function resolveInitialSrc(
  src: string | null | undefined,
  type: ImageFallbackType,
  title: string
): string {
  if (!src || !imageService.isValidImagePath(src)) {
    return getFallbackForType(type, title);
  }

  // If already a full URL or data URI, return as-is
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  // Relative TMDB path
  switch (type) {
    case "backdrop":
      return imageService.getBackdropUrl(src, "original", title);
    case "profile":
      return imageService.getProfileUrl(src, "w185", title);
    case "logo":
      return imageService.getLogoUrl(src, "w300", title) || getFallbackLogo(title);
    case "poster":
    case "general":
    default:
      return imageService.getPosterUrl(src, "w500", title);
  }
}

/**
 * SafeImage Component
 * Handles TMDB image loading, network 404s, and malformed paths gracefully.
 * Automatically switches to the authentic Showara SVG fallback on load failure.
 */
export default function SafeImage({
  src,
  alt,
  type,
  fallbackType,
  fallbackTitle,
  className,
  onError,
  unoptimized,
  ...restProps
}: SafeImageProps) {
  const resolvedType = fallbackType || type || "poster";
  const title = fallbackTitle || alt || "Showara Cinema";

  const [currentSrc, setCurrentSrc] = useState<string>(() =>
    resolveInitialSrc(src, resolvedType, title)
  );
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  // Sync state if src or title changes
  useEffect(() => {
    setCurrentSrc(resolveInitialSrc(src, resolvedType, title));
    setHasFailed(false);
  }, [src, resolvedType, title]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (hasFailed || currentSrc.startsWith("data:")) return; // Prevent infinite loop if fallback also errors

    setHasFailed(true);
    const fallbackSrc = getFallbackForType(resolvedType, title);
    setCurrentSrc(fallbackSrc);

    if (onError) {
      onError(e);
    }
  };

  const isDataUrl = currentSrc.startsWith("data:");

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      unoptimized={isDataUrl || unoptimized}
      {...restProps}
    />
  );
}

// Re-export as TmdbImage for semantic flexibility
export { SafeImage as TmdbImage };
