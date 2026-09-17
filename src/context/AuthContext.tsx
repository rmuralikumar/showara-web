"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: UserProfile;
  isLoaded: boolean;
  isSignedIn: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => Promise<void>;
}

const ANONYMOUS_USER: UserProfile = {
  id: "",
  name: "",
  email: "",
  imageUrl: "",
  isLoggedIn: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated" && Boolean(session?.user);

  const user: UserProfile = useMemo(() => {
    if (!isSignedIn || !session?.user) {
      return ANONYMOUS_USER;
    }

    const primaryEmail = session.user.email || "";
    const fullName =
      session.user.name ||
      (primaryEmail ? primaryEmail.split("@")[0] : "Moviegoer");

    return {
      id: session.user.id || (primaryEmail ? `usr_${primaryEmail.replace(/[^a-zA-Z0-9]/g, "_")}` : ""),
      name: fullName,
      email: primaryEmail,
      imageUrl: session.user.image || "",
      isLoggedIn: true,
    };
  }, [isSignedIn, session]);

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      router.push("/");
    } catch (err) {
      console.warn("SignOut error:", err);
    }
  };

  const updateProfile = async (data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    try {
      let fullName = data.name;
      if (!fullName && (data.firstName || data.lastName)) {
        fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
      }
      if (fullName) {
        await update({ name: fullName });
      }
    } catch (err) {
      console.error("User profile update error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
