/**
 * MSG91 OTP Integration Service
 * Official API Documentation: https://docs.msg91.com/
 * 
 * Provides server-side OTP dispatch and verification using MSG91 official endpoints.
 * Never exposes credentials to client-side code.
 */

export interface Msg91Config {
  authKey: string;
  templateId: string;
  senderId?: string;
  isConfigured: boolean;
}

export function getMsg91Config(): Msg91Config {
  const authKey = (process.env.MSG91_AUTH_KEY || "").trim();
  const templateId = (process.env.MSG91_TEMPLATE_ID || "").trim();
  const senderId = (process.env.MSG91_SENDER_ID || "").trim();

  return {
    authKey,
    templateId,
    senderId: senderId || undefined,
    isConfigured: Boolean(authKey && templateId),
  };
}

/**
 * Validates and formats an Indian mobile number.
 * Accepts: "9876543210", "+91 98765 43210", "919876543210"
 * Returns standard 12-digit format required by MSG91: "919876543210"
 */
export function formatIndianMobile(rawPhone: string): {
  valid: boolean;
  formatted: string; // e.g. "919876543210"
  national: string;  // e.g. "9876543210"
  display: string;   // e.g. "+91 98765 43210"
} {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { valid: false, formatted: "", national: "", display: "" };
  }

  const cleaned = rawPhone.replace(/\D/g, "");

  // 10-digit format (starting with 6, 7, 8, 9)
  if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) {
    return {
      valid: true,
      formatted: `91${cleaned}`,
      national: cleaned,
      display: `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`,
    };
  }

  // 12-digit format with 91 prefix
  if (cleaned.length === 12 && cleaned.startsWith("91") && /^91[6-9]\d{9}$/.test(cleaned)) {
    const nat = cleaned.slice(2);
    return {
      valid: true,
      formatted: cleaned,
      national: nat,
      display: `+91 ${nat.slice(0, 5)} ${nat.slice(5)}`,
    };
  }

  return { valid: false, formatted: "", national: "", display: "" };
}

/**
 * Sends a REAL SMS OTP via MSG91 OTP API.
 */
export async function sendMsg91Otp(mobileFormatted: string): Promise<{
  success: boolean;
  message: string;
  requestId?: string;
}> {
  const config = getMsg91Config();

  if (!config.isConfigured) {
    // Graceful handling when MSG91 credentials are not yet set in environment
    console.warn(
      "MSG91 credentials missing. Please set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID in environment."
    );
    return {
      success: false,
      message:
        "SMS service configuration missing. Please configure MSG91_AUTH_KEY and MSG91_TEMPLATE_ID.",
    };
  }

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.append("template_id", config.templateId);
    url.searchParams.append("mobile", mobileFormatted);
    url.searchParams.append("otp_length", "6");
    url.searchParams.append("otp_expiry", "10"); // 10 minutes

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        authkey: config.authKey,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.type === "success" || data.message?.toLowerCase().includes("otp sent"))) {
      return {
        success: true,
        message: "OTP sent successfully to your mobile number.",
        requestId: data.request_id,
      };
    }

    return {
      success: false,
      message: data.message || "Failed to deliver SMS OTP. Please check your number and retry.",
    };
  } catch (err: any) {
    console.error("sendMsg91Otp network error:", err);
    return {
      success: false,
      message: "SMS gateway communication error. Please try again shortly.",
    };
  }
}

/**
 * Retries/Resends an OTP via MSG91 Retry API.
 */
export async function resendMsg91Otp(mobileFormatted: string): Promise<{
  success: boolean;
  message: string;
}> {
  const config = getMsg91Config();

  if (!config.isConfigured) {
    return {
      success: false,
      message: "MSG91 credentials missing in environment configuration.",
    };
  }

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp/retry");
    url.searchParams.append("authkey", config.authKey);
    url.searchParams.append("mobile", mobileFormatted);
    url.searchParams.append("retrytype", "text");

    const res = await fetch(url.toString(), {
      method: "GET",
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.type === "success" || data.message?.toLowerCase().includes("otp"))) {
      return {
        success: true,
        message: "A new OTP has been sent to your mobile phone.",
      };
    }

    return {
      success: false,
      message: data.message || "Failed to resend OTP. Please try again later.",
    };
  } catch (err: any) {
    console.error("resendMsg91Otp error:", err);
    return {
      success: false,
      message: "Network error while resending OTP.",
    };
  }
}

/**
 * Verifies a 6-digit OTP entered by the user via MSG91 Verify API.
 */
export async function verifyMsg91Otp(
  mobileFormatted: string,
  otp: string
): Promise<{
  success: boolean;
  message: string;
}> {
  const config = getMsg91Config();

  if (!config.isConfigured) {
    return {
      success: false,
      message: "MSG91 credentials missing in environment configuration.",
    };
  }

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.append("otp", otp.trim());
    url.searchParams.append("mobile", mobileFormatted);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        authkey: config.authKey,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (
      res.ok &&
      (data.type === "success" ||
        data.message?.toLowerCase().includes("verified") ||
        data.message?.toLowerCase().includes("success"))
    ) {
      return {
        success: true,
        message: "OTP verified successfully.",
      };
    }

    return {
      success: false,
      message: data.message || "Invalid OTP. Please check the code received on your phone.",
    };
  } catch (err: any) {
    console.error("verifyMsg91Otp error:", err);
    return {
      success: false,
      message: "Error verifying OTP with SMS gateway.",
    };
  }
}
