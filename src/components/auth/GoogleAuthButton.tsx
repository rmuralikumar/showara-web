"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  mode?: "sign-in" | "sign-up";
  redirectUrlComplete?: string;
  variant?: "default" | "navbar";
  className?: string;
}

export default function GoogleAuthButton({
  redirectUrlComplete = "/",
  variant = "default",
  className = "",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await signIn("google", { callbackUrl: redirectUrlComplete });
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      let msg = "Failed to connect with Google. Please check your connection and try again.";
      if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  if (variant === "navbar") {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          aria-label="Continue with Google"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-card)] transition-all touch-target shadow-sm disabled:opacity-60 flex-shrink-0 cursor-pointer ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-[var(--brand-primary)] animate-spin flex-shrink-0" />
          ) : (
            <GoogleIcon className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="font-bold whitespace-nowrap">Continue with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium leading-relaxed animate-in fade-in duration-200"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading}
        aria-label="Continue with Google"
        className="w-full relative flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-neutral-50 active:scale-[0.99] text-neutral-800 text-sm font-bold shadow-md hover:shadow-lg border border-neutral-200 transition-all touch-target disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
            <span className="text-neutral-700">Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="tracking-tight">Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Official Google 4-color 'G' SVG Logo
 */
export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
