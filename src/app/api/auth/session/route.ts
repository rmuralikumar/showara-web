import { NextRequest, NextResponse } from "next/server";
import {
  getServerSession,
  createSessionToken,
  setSessionCookie,
  SessionUser,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    let session = getServerSession(request);

    if (!session) {
      // Auto-issue an authenticated guest session if none exists
      const guestUser: SessionUser = {
        id: `guest-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
        name: "Guest Moviegoer",
        email: "",
        isGuest: true,
      };
      const token = createSessionToken(guestUser);
      const res = NextResponse.json({
        authenticated: true,
        user: guestUser,
      });
      setSessionCookie(res, token);
      return res;
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });
  } catch (err: any) {
    console.error("API /api/auth/session error:", err);
    return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });
  }
}
