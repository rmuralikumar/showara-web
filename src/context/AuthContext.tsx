"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: UserProfile;
  login: (email: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr-88210",
  name: "Murali Kumar",
  email: "murali@showara.internal",
  phone: "+91 98840 12345",
  isLoggedIn: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    // 1. Initial local state check
    try {
      const saved = localStorage.getItem("showara_user_profile");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {}

    // 2. Sync / establish secure server-side session
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const syncedUser: UserProfile = {
            id: data.user.id,
            name: data.user.name || "Moviegoer",
            email: data.user.email || "",
            phone: data.user.phone || "+91 98840 12345",
            isLoggedIn: !data.user.isGuest,
          };
          setUser(syncedUser);
          localStorage.setItem("showara_user_profile", JSON.stringify(syncedUser));
        }
      })
      .catch((err) => {
        console.warn("Server session sync error:", err);
      });
  }, []);

  const login = async (email: string, name?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const updated: UserProfile = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "+91 98840 12345",
          isLoggedIn: true,
        };
        setUser(updated);
        localStorage.setItem("showara_user_profile", JSON.stringify(updated));
        return;
      }
    } catch (err) {
      console.error("Login request error:", err);
    }

    // Fallback local state
    const fallback: UserProfile = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      name: name || "Cinema Enthusiast",
      email,
      phone: "+91 98840 12345",
      isLoggedIn: true,
    };
    setUser(fallback);
    localStorage.setItem("showara_user_profile", JSON.stringify(fallback));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Logout request error:", err);
    }

    const guest: UserProfile = {
      id: "guest",
      name: "Guest User",
      email: "",
      phone: "",
      isLoggedIn: false,
    };
    setUser(guest);
    localStorage.setItem("showara_user_profile", JSON.stringify(guest));
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("showara_user_profile", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
