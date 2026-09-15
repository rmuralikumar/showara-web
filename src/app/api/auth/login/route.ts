import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, SessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0] || "Showara User").trim();

    const user: SessionUser = {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`,
      name: cleanName,
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "+91 98840 12345",
      role: "user",
      isGuest: false,
    };

    const token = createSessionToken(user);
    const res = NextResponse.json({
      success: true,
      user,
      message: "Authentication successful",
    });

    setSessionCookie(res, token);
    return res;
  } catch (err: any) {
    console.error("API /api/auth/login error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
