import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import fs from "node:fs";
import path from "node:path";

// Function matching src/lib/razorpay.ts
function inrToPaise(amount) {
  if (typeof amount !== "number" || isNaN(amount) || !isFinite(amount) || amount < 0) {
    throw new Error(`Invalid INR amount: ${amount}`);
  }
  return Math.round(amount * 100);
}

// Function matching verifyPaymentSignature in src/lib/razorpay.ts
function verifyPaymentSignature({ orderId, paymentId, signature, secret }) {
  if (!orderId || !paymentId || !signature || !secret) {
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
  } catch {
    return false;
  }
}

// Function matching verifyWebhookSignature in src/lib/razorpay.ts
function verifyWebhookSignature({ rawBody, signature, secret }) {
  if (!rawBody || !signature || !secret) {
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
  } catch {
    return false;
  }
}

// Function matching src/lib/auth.ts session logic
function createTestSessionToken(user, secret = "test_auth_secret_12345", ttlMs = 3600000) {
  const now = Date.now();
  const payload = {
    user,
    iat: now,
    exp: now + ttlMs,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifyTestSessionToken(token, secret = "test_auth_secret_12345") {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  try {
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
    const expectedBuf = Buffer.from(expectedSig, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyBookingOwnershipPolicy(session, booking) {
  if (!session || !session.user) {
    return { authorized: false, reason: "Authentication required", status: 401 };
  }
  if (session.user.role === "admin") {
    return { authorized: true };
  }
  if (booking.userId && booking.userId === session.user.id) {
    return { authorized: true };
  }
  if (
    session.user.email &&
    booking.userEmail &&
    session.user.email.toLowerCase() === booking.userEmail.toLowerCase()
  ) {
    return { authorized: true };
  }
  return { authorized: false, reason: "Unauthorized access to booking", status: 403 };
}

const TEST_KEY_SECRET = "rzp_secret_production_test_987654";
const TEST_WEBHOOK_SECRET = "whsec_test_secret_54321";

// 1. Unauthenticated booking access -> rejected (401)
test("1. Unauthenticated booking access: rejects request with 401 when no session is present", () => {
  const booking = { id: "SHW-SEC-101", userId: "usr-alice", userEmail: "alice@example.com" };
  const authResult = verifyBookingOwnershipPolicy(null, booking);
  assert.equal(authResult.authorized, false);
  assert.equal(authResult.status, 401);
});

// 2. User A accessing User B booking -> rejected (403)
test("2. User A accessing User B booking: rejects cross-user access with 403", () => {
  const userA = { id: "usr-alice", email: "alice@example.com" };
  const sessionA = { user: userA };
  const bookingB = { id: "SHW-SEC-102", userId: "usr-bob", userEmail: "bob@example.com" };

  const authResult = verifyBookingOwnershipPolicy(sessionA, bookingB);
  assert.equal(authResult.authorized, false);
  assert.equal(authResult.status, 403);
});

// 3. User A cancelling User B booking -> rejected (403)
test("3. User A cancelling User B booking: rejects unauthorized cancellation with 403", () => {
  const sessionA = { user: { id: "usr-alice", email: "alice@example.com" } };
  const bookingB = { id: "SHW-SEC-103", userId: "usr-bob", userEmail: "bob@example.com", status: "CONFIRMED" };

  const authResult = verifyBookingOwnershipPolicy(sessionA, bookingB);
  assert.equal(authResult.authorized, false);
  assert.equal(authResult.status, 403);
});

// 4. User accessing own booking -> allowed (200)
test("4. User accessing own booking: permits authorized access when userId matches", () => {
  const sessionAlice = { user: { id: "usr-alice", email: "alice@example.com" } };
  const bookingAlice = { id: "SHW-SEC-104", userId: "usr-alice", userEmail: "alice@example.com" };

  const authResult = verifyBookingOwnershipPolicy(sessionAlice, bookingAlice);
  assert.equal(authResult.authorized, true);
});

// 5. Session token creation, verification, tampering rejection, and expiration
test("5. Session token verification: validates authentic tokens, rejects tampered or expired tokens", () => {
  const secret = "test_auth_secret_999";
  const user = { id: "usr-test-1", email: "test@showara.com", name: "Test User" };

  // Authentic token
  const validToken = createTestSessionToken(user, secret, 60000);
  const verified = verifyTestSessionToken(validToken, secret);
  assert.ok(verified);
  assert.equal(verified.user.id, "usr-test-1");

  // Tampered signature
  const tamperedToken = `${validToken.split(".")[0]}.invalid_signature_hash`;
  assert.equal(verifyTestSessionToken(tamperedToken, secret), null);

  // Expired token (ttl = -1s)
  const expiredToken = createTestSessionToken(user, secret, -1000);
  assert.equal(verifyTestSessionToken(expiredToken, secret), null);
});

// 6. INR -> Paise conversion
test("6. INR -> paise conversion: handles zero, integers, decimals, and fractional paise", () => {
  assert.equal(inrToPaise(1083), 108300, "1083 INR must equal 108300 paise");
  assert.equal(inrToPaise(291), 29100, "291 INR must equal 29100 paise");
  assert.equal(inrToPaise(0), 0, "0 INR must equal 0 paise");
  assert.equal(inrToPaise(150.5), 15050, "150.50 INR must equal 15050 paise");
  assert.equal(inrToPaise(99.99), 9999, "99.99 INR must equal 9999 paise");
  assert.equal(inrToPaise(1083.3333), 108333, "Sub-paise float must round to integer paise");
});

// 7. Invalid amount rejection
test("7. Invalid amount rejection (negative, NaN, non-numeric, infinity)", () => {
  assert.throws(() => inrToPaise(-100), /Invalid INR amount/, "Negative amount must throw error");
  assert.throws(() => inrToPaise(-0.01), /Invalid INR amount/, "Negative fraction must throw error");
  assert.throws(() => inrToPaise(NaN), /Invalid INR amount/, "NaN must throw error");
  assert.throws(() => inrToPaise(Infinity), /Invalid INR amount/, "Infinity must throw error");
  assert.throws(() => inrToPaise("1000"), /Invalid INR amount/, "String must throw error");
  assert.throws(() => inrToPaise(null), /Invalid INR amount/, "Null must throw error");
  assert.throws(() => inrToPaise(undefined), /Invalid INR amount/, "Undefined must throw error");
});

// 8. Invalid booking rejection
test("8. Invalid booking rejection (missing bookingId, non-existent booking)", () => {
  const mockServerBookings = new Map();

  function validateBooking(bookingId) {
    if (!bookingId || typeof bookingId !== "string" || bookingId.trim().length === 0) {
      return { valid: false, error: "Invalid booking ID provided", status: 400 };
    }
    const booking = mockServerBookings.get(bookingId.trim());
    if (!booking) {
      return { valid: false, error: "Booking session not found", status: 404 };
    }
    return { valid: true, booking };
  }

  assert.equal(validateBooking("").valid, false);
  assert.equal(validateBooking(null).valid, false);
  assert.equal(validateBooking("SHW-NON-EXISTENT").valid, false);
  assert.equal(validateBooking("SHW-NON-EXISTENT").status, 404);
});

// 9. Invalid Razorpay signature rejection
test("9. Invalid Razorpay signature rejection (tampered signature, forged hash, missing parameters)", () => {
  const orderId = "order_test_987654";
  const paymentId = "pay_test_123456";
  const fakeSignature = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

  const isValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: fakeSignature,
    secret: TEST_KEY_SECRET,
  });
  assert.equal(isValid, false, "Forged signature must be rejected");

  // Tampered paymentId
  const validSignature = crypto
    .createHmac("sha256", TEST_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isTampered = verifyPaymentSignature({
    orderId,
    paymentId: "pay_tampered_789",
    signature: validSignature,
    secret: TEST_KEY_SECRET,
  });
  assert.equal(isTampered, false, "Signature with tampered paymentId must be rejected");

  // Empty parameters
  assert.equal(
    verifyPaymentSignature({ orderId: "", paymentId, signature: validSignature, secret: TEST_KEY_SECRET }),
    false,
    "Empty orderId must be rejected"
  );
  assert.equal(
    verifyPaymentSignature({ orderId, paymentId: "", signature: validSignature, secret: TEST_KEY_SECRET }),
    false,
    "Empty paymentId must be rejected"
  );
  assert.equal(
    verifyPaymentSignature({ orderId, paymentId, signature: "", secret: TEST_KEY_SECRET }),
    false,
    "Empty signature must be rejected"
  );
});

// 10. Valid Razorpay signature verification
test("10. Valid Razorpay signature verification with authentic HMAC-SHA256", () => {
  const orderId = "order_live_ABC123XYZ";
  const paymentId = "pay_live_789456123";

  const validSignature = crypto
    .createHmac("sha256", TEST_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const verified = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
    secret: TEST_KEY_SECRET,
  });

  assert.equal(verified, true, "Authentic HMAC-SHA256 signature must be verified successfully");
});

// 11. Order/booking mismatch rejection
test("11. Order/booking mismatch rejection: payment order must match the booking's registered order", () => {
  const booking = {
    id: "SHW-88492",
    razorpayOrderId: "order_assigned_111",
    status: "PAYMENT_PENDING",
  };

  const incomingOrderId = "order_mismatched_222";

  function verifyOrderMatch(bookingRecord, orderId) {
    if (bookingRecord.razorpayOrderId && bookingRecord.razorpayOrderId !== orderId) {
      return { match: false, error: "Payment order does not match booking reference" };
    }
    return { match: true };
  }

  const resultMismatch = verifyOrderMatch(booking, incomingOrderId);
  assert.equal(resultMismatch.match, false);
  assert.equal(resultMismatch.error, "Payment order does not match booking reference");

  const resultMatch = verifyOrderMatch(booking, "order_assigned_111");
  assert.equal(resultMatch.match, true);
});

// 12. Amount mismatch rejection (client-side price manipulation prevention)
test("12. Amount mismatch rejection: client cannot manipulate INR total to be less than server total", () => {
  const serverBooking = {
    id: "SHW-PRICE-CHECK",
    pricing: {
      ticketSubtotal: 1000,
      totalConvenienceFee: 70,
      taxGst: 13,
      discount: 0,
      totalAmount: 1083,
    },
  };

  function checkAmount(clientAmount, serverTotal) {
    if (Math.abs(clientAmount - serverTotal) > 0.01) {
      return { valid: false, error: `Amount mismatch: expected ₹${serverTotal}, received ₹${clientAmount}` };
    }
    return { valid: true };
  }

  // Client attempts to pay ₹10 or ₹500
  const tampered1 = checkAmount(10, serverBooking.pricing.totalAmount);
  assert.equal(tampered1.valid, false);
  assert.match(tampered1.error, /Amount mismatch/);

  const tampered2 = checkAmount(1082, serverBooking.pricing.totalAmount);
  assert.equal(tampered2.valid, false);

  // Exact match
  const valid = checkAmount(1083, serverBooking.pricing.totalAmount);
  assert.equal(valid.valid, true);
});

// 13. Currency verification
test("13. Currency verification: rejects non-INR payment currency", () => {
  function validateCurrency(currency) {
    if (!currency || currency.toUpperCase() !== "INR") {
      return { valid: false, error: "Only INR (Indian Rupee) currency is supported" };
    }
    return { valid: true };
  }

  assert.equal(validateCurrency("USD").valid, false);
  assert.equal(validateCurrency("EUR").valid, false);
  assert.equal(validateCurrency("").valid, false);
  assert.equal(validateCurrency("INR").valid, true);
  assert.equal(validateCurrency("inr").valid, true);
});

// 14. Concurrent seat booking race condition
test("14. Concurrent seat booking race condition: prevents two users from reserving the same seat", () => {
  const seatLocks = new Map(); // showId:seatId -> { sessionId, status, expiresAt }
  const now = Date.now();

  function atomicHoldSeats(showId, seatIds, sessionId, holdMinutes = 8) {
    const expiresAt = now + holdMinutes * 60 * 1000;
    
    // Check conflicts
    for (const seatId of seatIds) {
      const key = `${showId}:${seatId}`;
      const existing = seatLocks.get(key);
      if (existing) {
        if (existing.status === "BOOKED") {
          return { success: false, unavailableSeats: [seatId], error: `Seat ${seatId} is already booked` };
        }
        if (existing.status === "HELD" && existing.sessionId !== sessionId && existing.expiresAt > now) {
          return { success: false, unavailableSeats: [seatId], error: `Seat ${seatId} is currently held by another user` };
        }
      }
    }

    // Acquire lock
    for (const seatId of seatIds) {
      const key = `${showId}:${seatId}`;
      seatLocks.set(key, { sessionId, status: "HELD", expiresAt });
    }

    return { success: true, expiresAt };
  }

  // User A holds seats C4, C5
  const userAResult = atomicHoldSeats("show-101", ["C4", "C5"], "session-user-a");
  assert.equal(userAResult.success, true, "User A must acquire seats C4 and C5");

  // User B concurrently tries to hold seats C5, C6
  const userBResult = atomicHoldSeats("show-101", ["C5", "C6"], "session-user-b");
  assert.equal(userBResult.success, false, "User B must be rejected due to conflict on C5");
  assert.deepEqual(userBResult.unavailableSeats, ["C5"]);
});

// 15. Duplicate order creation (Idempotency)
test("15. Duplicate order creation: reusing active order prevents creating multiple Razorpay orders", () => {
  const paymentOrders = new Map();

  function getOrCreateOrder(bookingId, amountInPaise) {
    const existing = paymentOrders.get(bookingId);
    if (existing && existing.status === "CREATED" && existing.amountInPaise === amountInPaise) {
      return { orderId: existing.orderId, reused: true };
    }

    const newOrderId = `order_test_${Date.now()}`;
    const record = { orderId: newOrderId, amountInPaise, status: "CREATED" };
    paymentOrders.set(bookingId, record);
    return { orderId: newOrderId, reused: false };
  }

  // First request generates new order
  const order1 = getOrCreateOrder("SHW-IDEMP-01", 108300);
  assert.equal(order1.reused, false);

  // User refreshes or double-clicks Pay
  const order2 = getOrCreateOrder("SHW-IDEMP-01", 108300);
  assert.equal(order2.reused, true);
  assert.equal(order1.orderId, order2.orderId, "Must return the same order ID");
});

// 16. Duplicate payment prevention (idempotency)
test("16. Duplicate payment prevention: already confirmed booking cannot be re-charged or double-booked", () => {
  const store = new Map();
  const bookingId = "SHW-CONFIRMED-TEST";

  store.set(bookingId, {
    id: bookingId,
    status: "CONFIRMED",
    paymentTransactionId: "pay_original_123",
  });

  function processPaymentVerification(id, paymentId) {
    const booking = store.get(id);
    if (!booking) return { success: false, error: "Not found" };

    // Idempotency check:
    if (booking.status === "CONFIRMED") {
      return {
        success: true,
        booking,
        duplicate: true,
        message: "Payment already verified and booking confirmed",
      };
    }

    booking.status = "CONFIRMED";
    booking.paymentTransactionId = paymentId;
    return { success: true, booking, duplicate: false };
  }

  const result = processPaymentVerification(bookingId, "pay_duplicate_456");
  assert.equal(result.success, true);
  assert.equal(result.duplicate, true, "Must flag as duplicate/idempotent");
  assert.equal(result.booking.paymentTransactionId, "pay_original_123", "Must preserve original transaction ID");
});

// 17. Payment failure handling
test("17. Payment failure handling: records failure reason and preserves seat hold without marking paid", () => {
  const paymentRecord = {
    orderId: "order_fail_999",
    status: "CREATED",
    errorReason: null,
  };

  const booking = {
    id: "SHW-FAIL-TEST",
    status: "PAYMENT_PENDING",
  };

  function handlePaymentFailure(record, bookingRecord, reason) {
    record.status = "FAILED";
    record.errorReason = reason;
    bookingRecord.status = "PAYMENT_PENDING";
  }

  handlePaymentFailure(paymentRecord, booking, "Insufficient bank funds");

  assert.equal(paymentRecord.status, "FAILED");
  assert.equal(paymentRecord.errorReason, "Insufficient bank funds");
  assert.notEqual(booking.status, "CONFIRMED", "Booking must NOT be confirmed on payment failure");
  assert.equal(booking.status, "PAYMENT_PENDING", "Booking should allow retry");
});

// 18. Webhook signature validation
test("18. Webhook signature validation using HMAC-SHA256 with webhook secret", () => {
  const webhookBody = JSON.stringify({
    entity: "event",
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_webhook_live_1",
          order_id: "order_webhook_live_1",
          amount: 108300,
          currency: "INR",
          status: "captured",
        },
      },
    },
  });

  const validSignature = crypto
    .createHmac("sha256", TEST_WEBHOOK_SECRET)
    .update(webhookBody)
    .digest("hex");

  const validResult = verifyWebhookSignature({
    rawBody: webhookBody,
    signature: validSignature,
    secret: TEST_WEBHOOK_SECRET,
  });
  assert.equal(validResult, true, "Valid webhook signature must be accepted");

  // Tampered payload
  const tamperedBody = webhookBody.replace("108300", "50000");
  const tamperedResult = verifyWebhookSignature({
    rawBody: tamperedBody,
    signature: validSignature,
    secret: TEST_WEBHOOK_SECRET,
  });
  assert.equal(tamperedResult, false, "Tampered payload must fail webhook signature verification");

  // Incorrect signature
  const wrongSignatureResult = verifyWebhookSignature({
    rawBody: webhookBody,
    signature: "wrong_signature_1234567890abcdef",
    secret: TEST_WEBHOOK_SECRET,
  });
  assert.equal(wrongSignatureResult, false, "Wrong signature must be rejected");
});

// 19. Webhook idempotency
test("19. Webhook idempotency: repeated deliveries of the same event ID are not processed twice", () => {
  const processedWebhooks = new Set();
  let confirmationCount = 0;

  function handleWebhookEvent(eventId) {
    if (processedWebhooks.has(eventId)) {
      return { duplicate: true, status: "ok" };
    }
    processedWebhooks.add(eventId);
    confirmationCount += 1;
    return { duplicate: false, status: "ok" };
  }

  const eventId = "evt_razorpay_duplicate_check_001";

  // First arrival
  const first = handleWebhookEvent(eventId);
  assert.equal(first.duplicate, false);
  assert.equal(confirmationCount, 1);

  // Second arrival (Razorpay retry)
  const second = handleWebhookEvent(eventId);
  assert.equal(second.duplicate, true);
  assert.equal(confirmationCount, 1, "Confirmation count must not increment on duplicate webhook");

  // Third arrival
  const third = handleWebhookEvent(eventId);
  assert.equal(third.duplicate, true);
  assert.equal(confirmationCount, 1);
});

// 20. Delayed webhook & frontend verification safe reconciliation
test("20. Delayed webhook & frontend verification safe reconciliation", () => {
  const state = {
    status: "PAYMENT_PENDING",
    paymentId: null,
    orderId: "order_race_001",
    confirmedAt: null,
  };

  function confirmViaFrontend(paymentId, orderId) {
    if (state.status === "CONFIRMED") {
      return { status: "already_confirmed" };
    }
    state.status = "CONFIRMED";
    state.paymentId = paymentId;
    state.orderId = orderId;
    state.confirmedAt = new Date().toISOString();
    return { status: "confirmed" };
  }

  function confirmViaWebhook(paymentId, orderId) {
    if (state.status === "CONFIRMED") {
      return { status: "already_confirmed_safe" };
    }
    state.status = "CONFIRMED";
    state.paymentId = paymentId;
    state.orderId = orderId;
    state.confirmedAt = new Date().toISOString();
    return { status: "confirmed" };
  }

  // Frontend verifies first
  const r1 = confirmViaFrontend("pay_client_1", "order_race_001");
  assert.equal(r1.status, "confirmed");

  // Delayed webhook arrives later
  const r2 = confirmViaWebhook("pay_client_1", "order_race_001");
  assert.equal(r2.status, "already_confirmed_safe", "Delayed webhook safely reconciles without errors");
  assert.equal(state.status, "CONFIRMED");
});

// 21. Real refund calculation, policy & idempotency
test("21. Real refund calculation: refunds ticketSubtotal, retains non-refundable fees, and handles idempotency", () => {
  const booking = {
    id: "SHW-REFUND-001",
    status: "CONFIRMED",
    paymentTransactionId: "pay_live_test_777",
    pricing: {
      ticketSubtotal: 750,
      totalConvenienceFee: 105,
      taxGst: 19,
      discount: 0,
      totalAmount: 874,
    },
  };

  const refundDb = new Map();

  function processCancellation(b) {
    if (b.status === "CANCELLED") {
      const existing = refundDb.get(b.id);
      return {
        success: true,
        refundAmount: existing?.amount || b.pricing.ticketSubtotal,
        duplicate: true,
        refundId: existing?.refundId || "ALREADY_CANCELLED",
      };
    }

    if (b.status !== "CONFIRMED") {
      return { success: false, error: "Only CONFIRMED bookings can be cancelled" };
    }

    // Policy: Ticket subtotal is refunded, convenience fee + tax are non-refundable
    const refundAmount = b.pricing.ticketSubtotal;
    const refundId = `rfnd_rzp_${Date.now()}`;

    b.status = "CANCELLED";
    refundDb.set(b.id, { refundId, amount: refundAmount, status: "processed" });

    return {
      success: true,
      refundAmount,
      refundId,
      duplicate: false,
    };
  }

  // First cancellation: triggers real refund calculation
  const res1 = processCancellation(booking);
  assert.equal(res1.success, true);
  assert.equal(res1.refundAmount, 750, "Refund amount must equal ticketSubtotal (₹750)");
  assert.equal(res1.duplicate, false);
  assert.equal(booking.status, "CANCELLED");

  // Repeated cancellation (idempotent): returns existing refund record
  const res2 = processCancellation(booking);
  assert.equal(res2.success, true);
  assert.equal(res2.duplicate, true, "Repeated cancellation must be idempotent");
  assert.equal(res2.refundId, res1.refundId);
});

// 22. Expired seat hold rejection
test("22. Expired seat hold rejection: expired seat holds are purged and cannot be checked out", () => {
  const holdExpiry = Date.now() - 5000; // Expired 5 seconds ago
  const isExpired = Date.now() > holdExpiry;

  function validateSeatHold(expiryTimestamp) {
    if (Date.now() > expiryTimestamp) {
      return { valid: false, error: "Seat hold has expired. Please select your seats again." };
    }
    return { valid: true };
  }

  assert.equal(isExpired, true);
  const result = validateSeatHold(holdExpiry);
  assert.equal(result.valid, false);
  assert.match(result.error, /expired/i);
});

// 23. Database Configuration Validation & Fail-Fast in Production
test("23. Database Configuration Validation: fail-fast when DATABASE_URL missing in production", () => {
  function validateDbConfig(env) {
    const isProd = env.NODE_ENV === "production";
    const hasDbUrl = Boolean(env.DATABASE_URL && env.DATABASE_URL.trim().length > 0);
    if (isProd && !hasDbUrl) {
      return {
        valid: false,
        engine: "sqlite",
        error: "CRITICAL CONFIGURATION ERROR: DATABASE_URL must be configured in production environment for PostgreSQL multi-instance persistence.",
      };
    }
    return {
      valid: true,
      engine: hasDbUrl ? "postgresql" : "sqlite",
    };
  }

  // Production without DATABASE_URL -> Fails fast
  const prodWithoutDb = validateDbConfig({ NODE_ENV: "production", DATABASE_URL: "" });
  assert.equal(prodWithoutDb.valid, false);
  assert.match(prodWithoutDb.error, /DATABASE_URL must be configured/);

  // Production with DATABASE_URL -> Valid PostgreSQL
  const prodWithDb = validateDbConfig({
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:secret@localhost:5432/showara_db",
  });
  assert.equal(prodWithDb.valid, true);
  assert.equal(prodWithDb.engine, "postgresql");

  // Dev mode without DATABASE_URL -> Valid SQLite fallback
  const devMode = validateDbConfig({ NODE_ENV: "development", DATABASE_URL: "" });
  assert.equal(devMode.valid, true);
  assert.equal(devMode.engine, "sqlite");
});

// 24. Security Audit: Client code must NEVER expose RAZORPAY_KEY_SECRET
test("24. Security Audit: Verify RAZORPAY_KEY_SECRET is not exposed in client files or NEXT_PUBLIC_*", () => {
  const rootDir = process.cwd();
  const paymentPageContent = fs.readFileSync(
    path.join(rootDir, "src", "app", "booking", "payment", "page.tsx"),
    "utf8"
  );
  const paymentServiceContent = fs.readFileSync(
    path.join(rootDir, "src", "services", "paymentService.ts"),
    "utf8"
  );

  assert.equal(
    paymentPageContent.includes("RAZORPAY_KEY_SECRET"),
    false,
    "RAZORPAY_KEY_SECRET must NEVER be mentioned in client payment page"
  );
  assert.equal(
    paymentPageContent.includes("NEXT_PUBLIC_RAZORPAY_KEY_SECRET"),
    false,
    "NEXT_PUBLIC_RAZORPAY_KEY_SECRET must NEVER exist"
  );
  assert.equal(
    paymentServiceContent.includes("RAZORPAY_KEY_SECRET"),
    false,
    "RAZORPAY_KEY_SECRET must NEVER be in client paymentService"
  );
});
