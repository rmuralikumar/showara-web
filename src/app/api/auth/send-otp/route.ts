import { NextRequest, NextResponse } from "next/server";
import { formatIndianMobile, sendMsg91Otp } from "@/lib/msg91";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check (max 5 OTP requests per minute per IP)
    const rl = checkRateLimit(request, { limit: 5, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const body = await request.json().catch(() => ({}));
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Mobile number is required" },
        { status: 400 }
      );
    }

    // 2. Validate Indian mobile format
    const phoneCheck = formatIndianMobile(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9." },
        { status: 400 }
      );
    }

    // 3. Dispatch real SMS OTP via MSG91
    const result = await sendMsg91Otp(phoneCheck.formatted);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your mobile number.",
      displayPhone: phoneCheck.display,
      phoneFormatted: phoneCheck.formatted,
    });
  } catch (err: any) {
    console.error("API /api/auth/send-otp error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
