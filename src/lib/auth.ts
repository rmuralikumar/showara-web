import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { DBBookingRecord } from "./db";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "user" | "admin";
  isGuest?: boolean;
}

export interface SessionPayload {
  user: SessionUser;
  iat: number; // issued at (ms)
  exp: number; // expires at (ms)
}

export const SESSION_COOKIE_NAME = "showara_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getAuthSecret(): string {
  const secret = (
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    "showara_secure_fallback_session_secret_2026"
  ).trim();
  return secret;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Token format: Base64URL(JSON(payload)).Base64URL(HMAC(payload, secret))
 */
export function createSessionToken(user: SessionUser, ttlMs: number = SESSION_TTL_MS): string {
  const now = Date.now();
  const payload: SessionPayload = {
    user,
    iat: now,
    exp: now + ttlMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = getAuthSecret();
  const signature = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Returns decoded payload if valid and not expired, null otherwise.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signature] = parts;
  const secret = getAuthSecret();

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");

    if (expectedBuf.length !== actualBuf.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    if (!payload.user || !payload.user.id) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the authenticated session from an incoming NextRequest.
 */
export function getServerSession(request: NextRequest): SessionPayload | null {
  const cookieVal = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieVal) {
    const session = verifySessionToken(cookieVal);
    if (session) return session;
  }

  // Fallback to Bearer token in Authorization header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    return verifySessionToken(token);
  }

  return null;
}

/**
 * Attaches the session cookie to an outgoing NextResponse.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/**
 * Clears the session cookie on logout.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Authorization policy: Ensures an authenticated user owns the requested booking.
 */
export function verifyBookingOwnership(
  session: SessionPayload | null,
  booking: DBBookingRecord
): { authorized: boolean; reason?: string } {
  if (!session || !session.user) {
    return { authorized: false, reason: "Authentication required" };
  }

  // Admin override if role is admin
  if (session.user.role === "admin") {
    return { authorized: true };
  }

  // Match user ID
  if (booking.userId && booking.userId === session.user.id) {
    return { authorized: true };
  }

  // If booking was placed with matching email
  if (
    session.user.email &&
    booking.userEmail &&
    session.user.email.toLowerCase() === booking.userEmail.toLowerCase()
  ) {
    return { authorized: true };
  }

  return { authorized: false, reason: "Unauthorized access to booking" };
}
