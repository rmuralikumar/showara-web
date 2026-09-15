-- Showara Movie Booking Database Schema
-- Production PostgreSQL Initialization & Migration Script

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(128),
    user_email VARCHAR(128),
    user_phone VARCHAR(32),
    show_id VARCHAR(64) NOT NULL,
    movie_title VARCHAR(256) NOT NULL,
    movie_poster TEXT,
    cinema_name VARCHAR(256),
    cinema_address TEXT,
    screen_name VARCHAR(64),
    date VARCHAR(32) NOT NULL,
    start_time VARCHAR(32) NOT NULL,
    format VARCHAR(32),
    language VARCHAR(32),
    seats JSONB NOT NULL,
    pricing JSONB NOT NULL,
    status VARCHAR(32) NOT NULL,
    payment_method VARCHAR(32),
    payment_transaction_id VARCHAR(128),
    razorpay_order_id VARCHAR(128),
    qr_code_data TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_show ON bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_bookings_order ON bookings(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- 2. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    razorpay_order_id VARCHAR(128) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(128),
    amount NUMERIC(10,2) NOT NULL,
    amount_in_paise BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    error_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);

-- 3. Atomic Seat Reservations Table
CREATE TABLE IF NOT EXISTS seat_reservations (
    id VARCHAR(128) PRIMARY KEY,
    show_id VARCHAR(64) NOT NULL,
    seat_id VARCHAR(32) NOT NULL,
    booking_id VARCHAR(64),
    session_id VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_show_seat UNIQUE(show_id, seat_id)
);

CREATE INDEX IF NOT EXISTS idx_seat_reservations_lookup ON seat_reservations(show_id, status);
CREATE INDEX IF NOT EXISTS idx_seat_reservations_booking ON seat_reservations(booking_id);

-- 4. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) NOT NULL,
    razorpay_payment_id VARCHAR(128) NOT NULL,
    razorpay_refund_id VARCHAR(128) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    amount_in_paise BIGINT NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_rzp_id ON refunds(razorpay_refund_id);

-- 5. Webhook Events Idempotency Table
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);
