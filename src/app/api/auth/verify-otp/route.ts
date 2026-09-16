import { NextRequest, NextResponse } from "next/server";
import { formatIndianMobile, verifyMsg91Otp } from "@/lib/msg91";
import { createSessionToken, setSessionCookie, SessionUser } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

// In-memory / persistent registered users store indexed by national mobile number
const registeredUsersByPhone = new Map<string, SessionUser>();

// Pre-seed the existing default user
registeredUsersByPhone.set("9884012345", {
  id: "usr-88210",
  name: "Murali Kumar",
  email: "murali@showara.internal",
  phone: "+91 98840 12345",
  role: "user",
  isGuest: false,
});

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) {
      return rateLimitResponse(rl.resetInSeconds);
    }

    const body = await request.json().catch(() => ({}));
    const { phone, otp } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    const phoneCheck = formatIndianMobile(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json({ error: "Invalid mobile number format." }, { status: 400 });
    }

    // 1. Real verification via MSG91 Verify API
    const verifyResult = await verifyMsg91Otp(phoneCheck.formatted, otp.trim());

    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.message }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = registeredUsersByPhone.get(phoneCheck.national);

    if (existingUser) {
      const token = createSessionToken(existingUser);
      const res = NextResponse.json({
        success: true,
        isNewUser: false,
        user: existingUser,
        message: "Login successful. Welcome back to Showara!",
      });
      setSessionCookie(res, token);
      return res;
    }

    // 3. New user -> prompt to complete profile
    return NextResponse.json({
      success: true,
      isNewUser: true,
      phone: phoneCheck.display,
      phoneFormatted: phoneCheck.formatted,
      message: "Mobile number verified. Please complete your profile.",
    });
  } catch (err: any) {
    console.error("API /api/auth/verify-otp error:", err);
    return NextResponse.json(
      { error: "Verification failed due to a server error. Please try again." },
      { status: 500 }
    );
  }
}

export { registeredUsersByPhone };
