import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("1. Viewport configuration has viewportFit cover for edge-to-edge mobile screens", () => {
  const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf8");

  assert.ok(
    content.includes('viewportFit: "cover"') || content.includes("viewportFit: 'cover'"),
    "layout.tsx must configure viewportFit cover for notch and home bar safe-area insets"
  );
});

test("2. Safe area utilities are defined in globals.css", () => {
  const cssPath = path.join(rootDir, "src", "app", "globals.css");
  const content = fs.readFileSync(cssPath, "utf8");

  assert.ok(content.includes(".pb-safe"), "globals.css must contain .pb-safe");
  assert.ok(content.includes(".pt-safe"), "globals.css must contain .pt-safe");
  assert.ok(content.includes(".pl-safe"), "globals.css must contain .pl-safe");
  assert.ok(content.includes(".pr-safe"), "globals.css must contain .pr-safe");
});

test("3. Header has safe area insets and non-collapsing mobile city button", () => {
  const headerPath = path.join(rootDir, "src", "components", "layout", "Header.tsx");
  const content = fs.readFileSync(headerPath, "utf8");

  assert.ok(content.includes("pt-safe"), "Header must include pt-safe for top notch/status bar");
  assert.ok(content.includes("pl-safe pr-safe"), "Header container must include pl-safe pr-safe");
  assert.ok(content.includes("min-h-[36px]"), "City selector button must maintain minimum 36px touch height");
});

test("4. Seat map includes mobile swipe cue, touch-pan-x, and pb-safe on sticky checkout bar", () => {
  const seatMapPath = path.join(rootDir, "src", "components", "booking", "SeatMap.tsx");
  const content = fs.readFileSync(seatMapPath, "utf8");

  assert.ok(content.includes("touch-pan-x"), "SeatMap grid container must specify touch-pan-x");
  assert.ok(content.includes("pb-safe"), "SeatMap bottom bar must include pb-safe for iOS home indicator");
  assert.ok(content.includes("flex-wrap"), "SeatMap top toolbar must use flex-wrap to prevent narrow overflow");
});

test("5. Payment page has order-1 on mobile for Order Summary & Razorpay Pay CTA", () => {
  const paymentPath = path.join(rootDir, "src", "app", "booking", "payment", "page.tsx");
  const content = fs.readFileSync(paymentPath, "utf8");

  assert.ok(
    content.includes("order-1 md:order-2"),
    "Payment page action card must have order-1 md:order-2 so CTA is immediately reachable on phones"
  );
  assert.ok(
    content.includes("order-2 md:order-1"),
    "Payment options info must have order-2 md:order-1 so it sits below CTA on mobile"
  );
  assert.ok(content.includes("pb-safe"), "Payment page must have pb-safe");
});

test("6. Movies catalog page uses windowed / compact pagination to prevent mobile overflow", () => {
  const moviesPath = path.join(rootDir, "src", "app", "movies", "page.tsx");
  const content = fs.readFileSync(moviesPath, "utf8");

  assert.ok(
    content.includes("getPageNumbers"),
    "Movies page must use getPageNumbers to window pagination numbers"
  );
  assert.ok(
    content.includes("sm:hidden") && content.includes("Page {currentPage} of {totalPages}"),
    "Movies page must display compact 'Page X of Y' on extra small mobile screens"
  );
});

test("7. Cinema detail page shows movie poster thumbnail on mobile", () => {
  const cinemaPath = path.join(rootDir, "src", "app", "cinemas", "[slug]", "page.tsx");
  const content = fs.readFileSync(cinemaPath, "utf8");

  assert.ok(
    content.includes("w-20 sm:w-24"),
    "Cinema detail page movie card should display responsive poster thumbnail on mobile"
  );
  assert.ok(content.includes("pb-safe"), "Cinema detail page container must include pb-safe");
});

test("8. Review page cards have responsive padding and safe area insets", () => {
  const reviewPath = path.join(rootDir, "src", "app", "booking", "review", "page.tsx");
  const content = fs.readFileSync(reviewPath, "utf8");

  assert.ok(content.includes("pb-safe"), "Review page container must include pb-safe");
  assert.ok(content.includes("p-4 sm:p-6"), "Review cards must use responsive p-4 sm:p-6 padding");
});

test("9. Account page handles member ID & email overflow with break-all and flex-wrap", () => {
  const accountPath = path.join(rootDir, "src", "app", "account", "page.tsx");
  const content = fs.readFileSync(accountPath, "utf8");

  assert.ok(content.includes("break-all"), "Account page must include break-all on email/member ID");
  assert.ok(content.includes("pb-safe"), "Account page must include pb-safe");
});

test("10. Booking confirmation page has responsive ticket QR and mobile-friendly action buttons", () => {
  const confPath = path.join(rootDir, "src", "app", "booking", "confirmation", "[bookingId]", "page.tsx");
  const content = fs.readFileSync(confPath, "utf8");

  assert.ok(content.includes("pb-safe"), "Booking confirmation must include pb-safe");
  assert.ok(
    content.includes("flex-col sm:flex-row"),
    "Booking confirmation action buttons must stack on mobile and row on tablet/desktop"
  );
});

test("11. MobileNav includes pb-safe, pl-safe, and pr-safe for portrait and landscape", () => {
  const navPath = path.join(rootDir, "src", "components", "layout", "MobileNav.tsx");
  const content = fs.readFileSync(navPath, "utf8");

  assert.ok(
    content.includes("pb-safe") && content.includes("pl-safe") && content.includes("pr-safe"),
    "MobileNav must include pb-safe, pl-safe, and pr-safe"
  );
});

test("12. Footer includes safe area insets and responsive grid layout", () => {
  const footerPath = path.join(rootDir, "src", "components", "layout", "Footer.tsx");
  const content = fs.readFileSync(footerPath, "utf8");

  assert.ok(content.includes("pb-safe"), "Footer must include pb-safe");
  assert.ok(content.includes("pl-safe pr-safe"), "Footer must include pl-safe pr-safe");
  assert.ok(content.includes("grid-cols-1 sm:grid-cols-2 md:grid-cols-5"), "Footer links must use responsive columns");
});
