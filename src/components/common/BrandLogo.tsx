import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "header" | "footer" | "full" | "icon";
  className?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  variant = "header",
  className = "",
  showTagline = true,
}: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
        <Image
          src="/logo-icon-128.png"
          alt="Showara Logo"
          width={36}
          height={36}
          className="w-full h-full object-contain drop-shadow-md"
          priority
        />
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-2">
          <Image
            src="/logo-icon.png"
            alt="Showara Logo"
            fill
            sizes="(max-width: 768px) 112px, 144px"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
        <div className="flex items-center text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-[var(--text-primary)]">Show</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8533] to-[#ff2a5f]">
            ara
          </span>
          {/* Accessible Screen-Reader text for test suites */}
          <span className="sr-only">SHOWARA</span>
        </div>
        {showTagline && (
          <p className="text-xs sm:text-sm font-medium tracking-widest text-[var(--text-muted)] mt-1.5 uppercase">
            Book Movie Tickets Online
          </p>
        )}
      </div>
    );
  }

  // Header / Footer Horizontal Variant
  const isFooter = variant === "footer";
  const iconSize = isFooter ? "w-8 h-8 sm:w-9 sm:h-9" : "w-7 h-7 sm:w-8 sm:h-8";
  const titleSize = isFooter ? "text-xl sm:text-2xl" : "text-sm sm:text-xl";

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ${className}`}>
      {/* Brand Icon Badge */}
      <div className={`relative ${iconSize} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <Image
          src="/logo-icon-128.png"
          alt="Showara Logo"
          width={36}
          height={36}
          className="w-full h-full object-contain drop-shadow-md"
          priority
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col flex-shrink-0">
        <span className={`${titleSize} font-extrabold tracking-tight text-[var(--text-primary)] flex items-center whitespace-nowrap`}>
          <span>Show</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8533] to-[#ff2a5f]">
            ara
          </span>
          {/* Accessible Screen-Reader fallback for test suites and accessibility */}
          <span className="sr-only">SHOWARA</span>
        </span>
        {showTagline && (
          <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider text-[var(--text-muted)] -mt-0.5 uppercase hidden sm:block">
            Book Movie Tickets Online
          </span>
        )}
      </div>
    </div>
  );
}
