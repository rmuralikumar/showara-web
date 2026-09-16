import { NextRequest, NextResponse } from "next/server";
import { formatIndianMobile, resendMsg91Otp } from "@/lib/msg91";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, { limit: 5, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const body = await request.json().catch(() => ({}));
    const { phone } = body;

    const phoneCheck = formatIndianMobile(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: "Invalid mobile number format." },
        { status: 400 }
      );
    }

    const result = await resendMsg91Otp(phoneCheck.formatted);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "A new OTP has been dispatched to your mobile number.",
    });
  } catch (err: any) {
    console.error("API /api/auth/resend-otp error:", err);
    return NextResponse.json(
      { error: "Failed to resend OTP. Please try again." },
      { status: 500 }
    );
  }
}
