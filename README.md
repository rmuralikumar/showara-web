# 🎬 Showara — Movie Ticket Booking Platform

Showara is a modern movie ticket booking platform designed to provide a smooth end-to-end cinema booking experience.

Users can discover movies, select cinemas and showtimes, choose seats, review their booking, complete payment, and receive a digital ticket with a QR code.

---

## ✨ Features

### 🎥 Movie Discovery
- Browse currently showing movies
- Movie posters, ratings, genres and languages
- Cinema and showtime information
- Movie detail pages
- Location-based cinema browsing

### 📅 Showtimes
- Select booking date
- Browse available cinemas
- View available showtimes
- Cinema facilities and screen information

### 💺 Seat Selection
- Interactive cinema seating layout
- Multiple seat categories
- Real-time selected-seat state
- Seat pricing by category
- Automatic ticket total calculation
- Visual indication of selected seats

### 🧾 Booking Review
- Movie and cinema details
- Selected date and showtime
- Selected seats
- Ticket price
- Convenience fee
- GST/tax calculation
- Promo code support
- Final payable amount

### 💳 Payment
- Multiple payment method options
- UPI & QR payments
- Credit/Debit Cards
- Net Banking & Wallets
- Razorpay payment integration
- Payment verification
- Booking confirmation after successful payment

### 🎟️ Digital Ticket
- Booking confirmation page
- Unique booking ID
- QR code ticket
- Confirmed seat information
- Transaction information
- Save ticket image
- Copy booking information

### 🔐 Authentication
- Google OAuth authentication
- User account
- Protected booking flow
- Booking history

### 🎨 UI / UX
- Modern cinema-focused interface
- Responsive design
- Light/Dark mode
- Smooth booking flow
- Responsive seat-selection experience
- Mobile-friendly layouts

---

## 🔄 Booking Flow

```text
Browse Movies
      ↓
Select Movie
      ↓
Select Cinema
      ↓
Select Date & Showtime
      ↓
Select Seats
      ↓
Review Booking
      ↓
Select Payment Method
      ↓
Razorpay Checkout
      ↓
Payment Verification
      ↓
Booking Confirmation
      ↓
Digital QR Ticket
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Auth:** Auth.js / NextAuth v5 with Google OAuth
- **Payments:** Razorpay (server-verified orders, HMAC signature verification, refunds)
- **Data:** Movie/cast data from TMDB; bookings, payments, and users persisted in SQLite (`src/lib/db.ts`, via Node's built-in `node:sqlite`)
- **Styling:** Tailwind CSS v4 with a CSS-variable-based Light/Dark theme system (`src/app/globals.css`, `src/context/ThemeContext.tsx`)

---

## 🚀 Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js session signing secret |
| `AUTH_URL` | Base URL for Auth.js callbacks (e.g. `http://localhost:3000`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client credentials |
| `TMDB_API_KEY` / `TMDB_READ_ACCESS_TOKEN` | The Movie Database API credentials |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API credentials |
| `RAZORPAY_WEBHOOK_SECRET` | Verifies incoming Razorpay webhook signatures |
| `NEXT_PUBLIC_APP_URL` | Public site URL |
| `DATABASE_URL` | Optional; enables Postgres instead of the default local SQLite file |

Google OAuth requires this redirect URI to be authorized in Google Cloud Console for each environment:

```
<your-app-url>/api/auth/callback/google
```

---

## 📜 Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # eslint
npm run test    # run the test suite (node --test)
npm run seed    # seed sample data
```

---

## 📁 Project Structure

- `src/app` — routes (movies, cinemas, booking flow, account, API routes)
- `src/components` — UI components (movies, booking, layout, auth)
- `src/context` — React context providers (auth, booking, theme, city)
- `src/lib` — server-side logic (auth, db, Razorpay, rate limiting)
- `src/services` — client-side data/service layers
- `tests` — test suite

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Razorpay Docs](https://razorpay.com/docs/)
