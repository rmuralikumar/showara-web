import crypto from "crypto";
import Razorpay from "razorpay";

export function getRazorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured: Boolean(keyId && keySecret),
  };
}

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured) {
    throw new Error(
      "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

/**
 * Accurately converts an INR rupee amount to Indian paise.
 * Ex: ₹1083.00 -> 108300 paise
 */
export function inrToPaise(amount: number): number {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount) || amount < 0) {
    throw new Error(`Invalid INR amount: ${amount}`);
  }
  return Math.round(amount * 100);
}

/**
 * Verifies the Razorpay payment checkout signature on the server using HMAC-SHA256.
 * Signature payload format: `${order_id}|${payment_id}`
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  customSecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  customSecret?: string;
}): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = customSecret || getRazorpayCredentials().keySecret;
  if (!secret) {
    console.error("Cannot verify payment signature: RAZORPAY_KEY_SECRET is missing.");
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (err) {
    console.error("Error verifying payment signature:", err);
    return false;
  }
}

/**
 * Verifies the Razorpay webhook signature on the server using HMAC-SHA256.
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  customSecret,
}: {
  rawBody: string;
  signature: string;
  customSecret?: string;
}): boolean {
  if (!rawBody || !signature) {
    return false;
  }

  const secret = customSecret || getRazorpayCredentials().webhookSecret;
  if (!secret) {
    console.error("Cannot verify webhook signature: RAZORPAY_WEBHOOK_SECRET is missing.");
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return false;
  }
}
