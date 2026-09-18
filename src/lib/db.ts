import path from "path";
import fs from "fs";
import os from "os";
import { DatabaseSync } from "node:sqlite";
import { Booking, BookingStatus, PaymentMethod, Seat } from "@/types/booking";

export interface DBPaymentRecord {
  id: string;
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  status: "CREATED" | "CAPTURED" | "FAILED";
  errorReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBRefundRecord {
  id: string;
  bookingId: string;
  razorpayPaymentId: string;
  razorpayRefundId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface DBBookingRecord extends Booking {
  razorpayOrderId?: string;
  confirmedAt?: string;
}

export interface DBUserRecord {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

// Global reference across dev hot-reloads
const globalForDB = globalThis as unknown as {
  __showaraDBInstance?: DatabaseSync;
};

function getSqliteInstance(): DatabaseSync {
  if (!globalForDB.__showaraDBInstance) {
    const dbDir = process.env.VERCEL
      ? path.join(os.tmpdir(), "showara-data")
      : path.resolve(process.cwd(), "src", "data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, "showara.db");
    const db = new DatabaseSync(dbPath);

    // Initialize required production-safe tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_email TEXT,
        user_phone TEXT,
        show_id TEXT NOT NULL,
        movie_title TEXT NOT NULL,
        movie_poster TEXT,
        cinema_name TEXT,
        cinema_address TEXT,
        screen_name TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        format TEXT,
        language TEXT,
        seats TEXT NOT NULL,
        pricing TEXT NOT NULL,
        status TEXT NOT NULL,
        payment_method TEXT,
        payment_transaction_id TEXT,
        razorpay_order_id TEXT,
        qr_code_data TEXT,
        created_at TEXT NOT NULL,
        confirmed_at TEXT,
        expires_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_show ON bookings(show_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_order ON bookings(razorpay_order_id);

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        image TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        razorpay_order_id TEXT UNIQUE NOT NULL,
        razorpay_payment_id TEXT,
        amount REAL NOT NULL,
        amount_in_paise INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL,
        error_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

      CREATE TABLE IF NOT EXISTS seat_reservations (
        id TEXT PRIMARY KEY,
        show_id TEXT NOT NULL,
        seat_id TEXT NOT NULL,
        booking_id TEXT,
        session_id TEXT NOT NULL,
        status TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(show_id, seat_id)
      );
      CREATE INDEX IF NOT EXISTS idx_seat_reservations_lookup ON seat_reservations(show_id, status);

      CREATE TABLE IF NOT EXISTS refunds (
        id TEXT PRIMARY KEY,
        booking_id TEXT NOT NULL,
        razorpay_payment_id TEXT NOT NULL,
        razorpay_refund_id TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        amount_in_paise INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'INR',
        status TEXT NOT NULL,
        reason TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);

      CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        payload TEXT,
        processed_at TEXT NOT NULL
      );
    `);

    globalForDB.__showaraDBInstance = db;
  }

  return globalForDB.__showaraDBInstance;
}

export const db = {
  // --- BOOKINGS ---
  getBooking(bookingId: string): DBBookingRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite
      .prepare("SELECT * FROM bookings WHERE id = ?")
      .get(bookingId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      showId: row.show_id,
      movieTitle: row.movie_title,
      moviePoster: row.movie_poster,
      cinemaName: row.cinema_name,
      cinemaAddress: row.cinema_address,
      screenName: row.screen_name,
      date: row.date,
      startTime: row.start_time,
      format: row.format,
      language: row.language,
      seats: JSON.parse(row.seats),
      pricing: JSON.parse(row.pricing),
      status: row.status as BookingStatus,
      paymentMethod: (row.payment_method || "UPI") as PaymentMethod,
      paymentTransactionId: row.payment_transaction_id || "",
      razorpayOrderId: row.razorpay_order_id || undefined,
      qrCodeData: row.qr_code_data || "",
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at || undefined,
      expiresAt: row.expires_at || undefined,
    };
  },

  getBookingByOrderId(orderId: string): DBBookingRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite
      .prepare("SELECT * FROM bookings WHERE razorpay_order_id = ?")
      .get(orderId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      showId: row.show_id,
      movieTitle: row.movie_title,
      moviePoster: row.movie_poster,
      cinemaName: row.cinema_name,
      cinemaAddress: row.cinema_address,
      screenName: row.screen_name,
      date: row.date,
      startTime: row.start_time,
      format: row.format,
      language: row.language,
      seats: JSON.parse(row.seats),
      pricing: JSON.parse(row.pricing),
      status: row.status as BookingStatus,
      paymentMethod: (row.payment_method || "UPI") as PaymentMethod,
      paymentTransactionId: row.payment_transaction_id || "",
      razorpayOrderId: row.razorpay_order_id || undefined,
      qrCodeData: row.qr_code_data || "",
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at || undefined,
      expiresAt: row.expires_at || undefined,
    };
  },

  getBookingsForUser(userId: string, userEmail?: string): DBBookingRecord[] {
    const sqlite = getSqliteInstance();
    let rows: any[] = [];
    if (userEmail && userEmail.trim().length > 0) {
      rows = sqlite
        .prepare(
          "SELECT * FROM bookings WHERE user_id = ? OR LOWER(user_email) = LOWER(?) ORDER BY created_at DESC"
        )
        .all(userId, userEmail.trim()) as any[];
    } else {
      rows = sqlite
        .prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC")
        .all(userId) as any[];
    }

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userPhone: row.user_phone,
      showId: row.show_id,
      movieTitle: row.movie_title,
      moviePoster: row.movie_poster,
      cinemaName: row.cinema_name,
      cinemaAddress: row.cinema_address,
      screenName: row.screen_name,
      date: row.date,
      startTime: row.start_time,
      format: row.format,
      language: row.language,
      seats: JSON.parse(row.seats || "[]"),
      pricing: JSON.parse(row.pricing || "{}"),
      status: row.status as BookingStatus,
      paymentMethod: (row.payment_method || "UPI") as PaymentMethod,
      paymentTransactionId: row.payment_transaction_id || "",
      razorpayOrderId: row.razorpay_order_id || undefined,
      qrCodeData: row.qr_code_data || "",
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at || undefined,
      expiresAt: row.expires_at || undefined,
    }));
  },

  upsertUser(user: { id: string; name?: string | null; email: string; image?: string | null }): DBUserRecord {
    const sqlite = getSqliteInstance();
    const now = new Date().toISOString();
    const existing = sqlite.prepare("SELECT * FROM users WHERE email = ?").get(user.email) as any;
    if (existing) {
      sqlite.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            image = COALESCE(?, image),
            updated_at = ?
        WHERE email = ?
      `).run(user.name ?? null, user.image ?? null, now, user.email);
      return {
        id: existing.id,
        name: user.name ?? existing.name,
        email: existing.email,
        image: user.image ?? existing.image,
        createdAt: existing.created_at,
        updatedAt: now,
      };
    } else {
      sqlite.prepare(`
        INSERT INTO users (id, name, email, image, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(user.id, user.name ?? null, user.email, user.image ?? null, now, now);
      return {
        id: user.id,
        name: user.name ?? null,
        email: user.email,
        image: user.image ?? null,
        createdAt: now,
        updatedAt: now,
      };
    }
  },

  getUserById(id: string): DBUserRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  getUserByEmail(email: string): DBUserRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  updateUserName(id: string, name: string): void {
    const sqlite = getSqliteInstance();
    const now = new Date().toISOString();
    sqlite.prepare("UPDATE users SET name = ?, updated_at = ? WHERE id = ?").run(name, now, id);
  },

  saveBooking(booking: DBBookingRecord): DBBookingRecord {
    const sqlite = getSqliteInstance();
    const stmt = sqlite.prepare(`
      INSERT INTO bookings (
        id, user_id, user_name, user_email, user_phone,
        show_id, movie_title, movie_poster, cinema_name, cinema_address, screen_name,
        date, start_time, format, language, seats, pricing,
        status, payment_method, payment_transaction_id, razorpay_order_id, qr_code_data,
        created_at, confirmed_at, expires_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        user_name = excluded.user_name,
        user_email = excluded.user_email,
        user_phone = excluded.user_phone,
        seats = excluded.seats,
        pricing = excluded.pricing,
        status = excluded.status,
        payment_method = excluded.payment_method,
        payment_transaction_id = excluded.payment_transaction_id,
        razorpay_order_id = excluded.razorpay_order_id,
        qr_code_data = excluded.qr_code_data,
        confirmed_at = excluded.confirmed_at,
        expires_at = excluded.expires_at
    `);

    stmt.run(
      booking.id,
      booking.userId,
      booking.userName,
      booking.userEmail,
      booking.userPhone,
      booking.showId,
      booking.movieTitle,
      booking.moviePoster,
      booking.cinemaName,
      booking.cinemaAddress,
      booking.screenName,
      booking.date,
      booking.startTime,
      booking.format,
      booking.language,
      JSON.stringify(booking.seats),
      JSON.stringify(booking.pricing),
      booking.status,
      booking.paymentMethod,
      booking.paymentTransactionId,
      booking.razorpayOrderId || null,
      booking.qrCodeData,
      booking.createdAt,
      booking.confirmedAt || null,
      booking.expiresAt || null
    );

    return booking;
  },

  // --- ATOMIC SEAT LOCKING ---
  holdSeats({
    showId,
    seatIds,
    sessionId,
    holdMinutes = 8,
  }: {
    showId: string;
    seatIds: string[];
    sessionId: string;
    holdMinutes?: number;
  }): { success: boolean; expiresAt?: number; unavailableSeats?: string[]; error?: string } {
    const sqlite = getSqliteInstance();
    const now = Date.now();
    const expiresAt = now + holdMinutes * 60 * 1000;

    sqlite.exec("BEGIN IMMEDIATE");
    try {
      // 1. Purge expired holds for this show
      sqlite
        .prepare("DELETE FROM seat_reservations WHERE show_id = ? AND status = 'HELD' AND expires_at < ?")
        .run(showId, now);

      // 2. Query any active reservations for requested seats
      const placeholders = seatIds.map(() => "?").join(",");
      const conflicts = sqlite
        .prepare(
          `SELECT seat_id, status, session_id, expires_at FROM seat_reservations 
           WHERE show_id = ? AND seat_id IN (${placeholders})`
        )
        .all(showId, ...seatIds) as any[];

      const unavailable: string[] = [];
      for (const row of conflicts) {
        if (row.status === "BOOKED") {
          unavailable.push(row.seat_id);
        } else if (row.status === "HELD" && row.session_id !== sessionId && row.expires_at >= now) {
          unavailable.push(row.seat_id);
        }
      }

      if (unavailable.length > 0) {
        sqlite.exec("ROLLBACK");
        return {
          success: false,
          unavailableSeats: unavailable,
          error: `Seat ${unavailable.join(", ")} is no longer available. Please select another seat.`,
        };
      }

      // 3. Remove old holds by this session on this show (allows updating selection)
      sqlite
        .prepare("DELETE FROM seat_reservations WHERE show_id = ? AND session_id = ? AND status = 'HELD'")
        .run(showId, sessionId);

      // 4. Atomically insert holds with UNIQUE(show_id, seat_id) constraint
      const insertStmt = sqlite.prepare(`
        INSERT INTO seat_reservations (id, show_id, seat_id, session_id, status, expires_at, created_at)
        VALUES (?, ?, ?, ?, 'HELD', ?, ?)
      `);

      for (const seatId of seatIds) {
        const id = `res-${showId}-${seatId}-${now}`;
        insertStmt.run(id, showId, seatId, sessionId, expiresAt, new Date().toISOString());
      }

      sqlite.exec("COMMIT");
      return { success: true, expiresAt };
    } catch (err: any) {
      sqlite.exec("ROLLBACK");
      return { success: false, error: err?.message || "Failed to hold seats atomically." };
    }
  },

  getSeatStatusForShow(showId: string): { lockedSeatIds: Set<string>; bookedSeatIds: Set<string> } {
    const sqlite = getSqliteInstance();
    const now = Date.now();

    // Clean up expired holds
    sqlite
      .prepare("DELETE FROM seat_reservations WHERE show_id = ? AND status = 'HELD' AND expires_at < ?")
      .run(showId, now);

    const rows = sqlite
      .prepare("SELECT seat_id, status FROM seat_reservations WHERE show_id = ?")
      .all(showId) as any[];

    const lockedSeatIds = new Set<string>();
    const bookedSeatIds = new Set<string>();

    for (const r of rows) {
      if (r.status === "BOOKED") {
        bookedSeatIds.add(r.seat_id);
      } else if (r.status === "HELD") {
        lockedSeatIds.add(r.seat_id);
      }
    }

    return { lockedSeatIds, bookedSeatIds };
  },

  releaseSeatHold(showId: string, sessionId: string): void {
    const sqlite = getSqliteInstance();
    sqlite
      .prepare("DELETE FROM seat_reservations WHERE show_id = ? AND session_id = ? AND status = 'HELD'")
      .run(showId, sessionId);
  },

  verifySeatHoldValid({
    showId,
    seatIds,
    sessionId,
  }: {
    showId: string;
    seatIds: string[];
    sessionId?: string;
  }): { valid: boolean; error?: string } {
    const sqlite = getSqliteInstance();
    const now = Date.now();

    // Clean up expired holds
    sqlite
      .prepare("DELETE FROM seat_reservations WHERE show_id = ? AND status = 'HELD' AND expires_at < ?")
      .run(showId, now);

    const placeholders = seatIds.map(() => "?").join(",");
    const rows = sqlite
      .prepare(
        `SELECT seat_id, status, session_id, expires_at FROM seat_reservations 
         WHERE show_id = ? AND seat_id IN (${placeholders})`
      )
      .all(showId, ...seatIds) as any[];

    for (const seatId of seatIds) {
      const match = rows.find((r) => r.seat_id === seatId);
      if (!match) {
        return {
          valid: false,
          error: `Seat ${seatId} hold has expired or is no longer reserved. Please re-select your seats.`,
        };
      }
      if (match.status === "BOOKED") {
        return {
          valid: false,
          error: `Seat ${seatId} was already purchased by another customer.`,
        };
      }
      if (match.status === "HELD" && sessionId && match.session_id !== sessionId) {
        return {
          valid: false,
          error: `Seat ${seatId} is currently reserved by another session.`,
        };
      }
    }

    return { valid: true };
  },

  // --- ATOMIC PAYMENT & CONFIRMATION ---
  confirmBookingAndSeats({
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    paymentMethod = "UPI",
  }: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    paymentMethod?: PaymentMethod;
  }): { success: boolean; booking?: DBBookingRecord; error?: string } {
    const sqlite = getSqliteInstance();
    const now = new Date().toISOString();
    const farFuture = 253402300799000; // Permanently booked

    sqlite.exec("BEGIN IMMEDIATE");
    try {
      const bRow = sqlite.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId) as any;
      if (!bRow) {
        sqlite.exec("ROLLBACK");
        return { success: false, error: "Booking record not found in database." };
      }

      // Idempotency: if already confirmed, commit & return existing
      if (bRow.status === "CONFIRMED") {
        sqlite.exec("COMMIT");
        return { success: true, booking: this.getBooking(bookingId)! };
      }

      if (bRow.status === "CANCELLED" || bRow.status === "EXPIRED") {
        sqlite.exec("ROLLBACK");
        return { success: false, error: `Cannot confirm booking in ${bRow.status} state.` };
      }

      const seats: Seat[] = JSON.parse(bRow.seats);
      const showId = bRow.show_id;

      // 1. Check if any seat is already booked by another booking
      for (const s of seats) {
        const existing = sqlite
          .prepare("SELECT booking_id, status FROM seat_reservations WHERE show_id = ? AND seat_id = ?")
          .get(showId, s.id) as any;

        if (existing && existing.status === "BOOKED" && existing.booking_id !== bookingId) {
          sqlite.exec("ROLLBACK");
          return {
            success: false,
            error: `Seat ${s.id} was already purchased in another concurrent transaction.`,
          };
        }
      }

      // 2. Transition all seats to permanent BOOKED
      for (const s of seats) {
        sqlite
          .prepare(
            `INSERT INTO seat_reservations (id, show_id, seat_id, booking_id, session_id, status, expires_at, created_at)
             VALUES (?, ?, ?, ?, 'confirmed', 'BOOKED', ?, ?)
             ON CONFLICT(show_id, seat_id) DO UPDATE SET
               booking_id = excluded.booking_id,
               status = 'BOOKED',
               expires_at = excluded.expires_at`
          )
          .run(`book-${showId}-${s.id}`, showId, s.id, bookingId, farFuture, now);
      }

      // 3. Update booking status
      const qrData = `SHOWARA:${bookingId}:${showId}:${seats.map((s) => s.id).join(",")}`;
      sqlite
        .prepare(
          `UPDATE bookings SET
             status = 'CONFIRMED',
             payment_transaction_id = ?,
             razorpay_order_id = ?,
             payment_method = ?,
             confirmed_at = ?,
             qr_code_data = ?
           WHERE id = ?`
        )
        .run(razorpayPaymentId, razorpayOrderId, paymentMethod, now, qrData, bookingId);

      // 4. Update payment status
      sqlite
        .prepare(
          `UPDATE payments SET
             status = 'CAPTURED',
             razorpay_payment_id = ?,
             updated_at = ?
           WHERE razorpay_order_id = ?`
        )
        .run(razorpayPaymentId, now, razorpayOrderId);

      sqlite.exec("COMMIT");
      return { success: true, booking: this.getBooking(bookingId)! };
    } catch (err: any) {
      sqlite.exec("ROLLBACK");
      return { success: false, error: err?.message || "Failed to confirm booking transaction." };
    }
  },

  // --- PAYMENTS ---
  savePayment(record: DBPaymentRecord): DBPaymentRecord {
    const sqlite = getSqliteInstance();
    sqlite
      .prepare(`
        INSERT INTO payments (
          id, booking_id, razorpay_order_id, razorpay_payment_id,
          amount, amount_in_paise, currency, status, error_reason,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(razorpay_order_id) DO UPDATE SET
          razorpay_payment_id = excluded.razorpay_payment_id,
          status = excluded.status,
          error_reason = excluded.error_reason,
          updated_at = excluded.updated_at
      `)
      .run(
        record.id,
        record.bookingId,
        record.razorpayOrderId,
        record.razorpayPaymentId || null,
        record.amount,
        record.amountInPaise,
        record.currency,
        record.status,
        record.errorReason || null,
        record.createdAt,
        record.updatedAt
      );

    // Link order to booking
    sqlite
      .prepare("UPDATE bookings SET razorpay_order_id = ? WHERE id = ?")
      .run(record.razorpayOrderId, record.bookingId);

    return record;
  },

  getPaymentByOrderId(orderId: string): DBPaymentRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite.prepare("SELECT * FROM payments WHERE razorpay_order_id = ?").get(orderId) as any;
    if (!row) return null;

    return {
      id: row.id,
      bookingId: row.booking_id,
      razorpayOrderId: row.razorpay_order_id,
      razorpayPaymentId: row.razorpay_payment_id || undefined,
      amount: row.amount,
      amountInPaise: row.amount_in_paise,
      currency: row.currency,
      status: row.status,
      errorReason: row.error_reason || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  getActiveOrderForBooking(bookingId: string): DBPaymentRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite
      .prepare("SELECT * FROM payments WHERE booking_id = ? AND status != 'FAILED' ORDER BY created_at DESC LIMIT 1")
      .get(bookingId) as any;

    if (!row) return null;

    return {
      id: row.id,
      bookingId: row.booking_id,
      razorpayOrderId: row.razorpay_order_id,
      razorpayPaymentId: row.razorpay_payment_id || undefined,
      amount: row.amount,
      amountInPaise: row.amount_in_paise,
      currency: row.currency,
      status: row.status,
      errorReason: row.error_reason || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  recordPaymentFailure(bookingId: string, orderId: string, reason: string, paymentId?: string): void {
    const sqlite = getSqliteInstance();
    const now = new Date().toISOString();

    sqlite
      .prepare(
        `UPDATE payments SET status = 'FAILED', error_reason = ?, razorpay_payment_id = ?, updated_at = ? WHERE razorpay_order_id = ?`
      )
      .run(reason, paymentId || null, now, orderId);

    const booking = this.getBooking(bookingId);
    if (booking && booking.status !== "CONFIRMED") {
      sqlite.prepare("UPDATE bookings SET status = 'PAYMENT_PENDING' WHERE id = ?").run(bookingId);
    }
  },

  // --- REFUNDS & CANCELLATION ---
  recordRefund({
    bookingId,
    razorpayPaymentId,
    razorpayRefundId,
    amount,
    amountInPaise,
    status,
    reason,
  }: {
    bookingId: string;
    razorpayPaymentId: string;
    razorpayRefundId: string;
    amount: number;
    amountInPaise: number;
    status: string;
    reason?: string;
  }): { success: boolean; refundId: string; error?: string } {
    const sqlite = getSqliteInstance();
    const now = new Date().toISOString();
    const refundDbId = `ref-${Date.now()}`;

    sqlite.exec("BEGIN IMMEDIATE");
    try {
      sqlite
        .prepare(`
          INSERT INTO refunds (
            id, booking_id, razorpay_payment_id, razorpay_refund_id,
            amount, amount_in_paise, currency, status, reason, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?)
        `)
        .run(
          refundDbId,
          bookingId,
          razorpayPaymentId,
          razorpayRefundId,
          amount,
          amountInPaise,
          status,
          reason || "Customer cancellation",
          now
        );

      // Update booking status to CANCELLED
      sqlite.prepare("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?").run(bookingId);

      // Release booked seats back to available
      sqlite.prepare("DELETE FROM seat_reservations WHERE booking_id = ?").run(bookingId);

      sqlite.exec("COMMIT");
      return { success: true, refundId: razorpayRefundId };
    } catch (err: any) {
      sqlite.exec("ROLLBACK");
      return { success: false, refundId: "", error: err?.message || "Failed to record refund." };
    }
  },

  getRefundForBooking(bookingId: string): DBRefundRecord | null {
    const sqlite = getSqliteInstance();
    const row = sqlite.prepare("SELECT * FROM refunds WHERE booking_id = ?").get(bookingId) as any;
    if (!row) return null;

    return {
      id: row.id,
      bookingId: row.booking_id,
      razorpayPaymentId: row.razorpay_payment_id,
      razorpayRefundId: row.razorpay_refund_id,
      amount: row.amount,
      amountInPaise: row.amount_in_paise,
      currency: row.currency,
      status: row.status,
      reason: row.reason || undefined,
      createdAt: row.created_at,
    };
  },

  // --- WEBHOOK IDEMPOTENCY ---
  hasWebhookBeenProcessed(eventId: string): boolean {
    const sqlite = getSqliteInstance();
    const row = sqlite.prepare("SELECT id FROM webhook_events WHERE id = ?").get(eventId);
    return Boolean(row);
  },

  markWebhookProcessed(eventId: string, eventType: string, payload?: any): void {
    const sqlite = getSqliteInstance();
    sqlite
      .prepare("INSERT OR IGNORE INTO webhook_events (id, event_type, payload, processed_at) VALUES (?, ?, ?, ?)")
      .run(eventId, eventType, payload ? JSON.stringify(payload) : null, new Date().toISOString());
  },
};

/**
 * Returns active database engine: 'postgresql' if DATABASE_URL is set, otherwise 'sqlite'.
 */
export function getDatabaseType(): "postgresql" | "sqlite" {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return "postgresql";
  }
  return "sqlite";
}

/**
 * Validates database configuration for production readiness.
 * In production mode (NODE_ENV=production), fail fast if DATABASE_URL is missing.
 */
export function validateDatabaseConfig(env = process.env): {
  valid: boolean;
  engine: "postgresql" | "sqlite";
  error?: string;
} {
  const isProd = env.NODE_ENV === "production";
  const hasDbUrl = Boolean(env.DATABASE_URL && env.DATABASE_URL.trim().length > 0);

  if (isProd && !hasDbUrl) {
    return {
      valid: false,
      engine: "sqlite",
      error:
        "CRITICAL CONFIGURATION ERROR: DATABASE_URL must be configured in production environment for PostgreSQL multi-instance persistence.",
    };
  }

  return {
    valid: true,
    engine: hasDbUrl ? "postgresql" : "sqlite",
  };
}

