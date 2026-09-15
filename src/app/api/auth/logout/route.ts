import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    clearSessionCookie(res);
    return res;
  } catch (err: any) {
    console.error("API /api/auth/logout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
