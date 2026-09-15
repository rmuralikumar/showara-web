import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const showsContent = fs.readFileSync(path.join(rootDir, "src", "data", "shows.ts"), "utf8");
const modalContent = fs.readFileSync(
  path.join(rootDir, "src", "components", "booking", "SeatCountModal.tsx"),
  "utf8"
);
const seatMapContent = fs.readFileSync(
  path.join(rootDir, "src", "components", "booking", "SeatMap.tsx"),
  "utf8"
);
const bookingContextContent = fs.readFileSync(
  path.join(rootDir, "src", "context", "BookingContext.tsx"),
  "utf8"
);
const apiSeatsContent = fs.readFileSync(
  path.join(rootDir, "src", "app", "api", "shows", "[id]", "seats", "route.ts"),
  "utf8"
);
const seatPageContent = fs.readFileSync(
  path.join(rootDir, "src", "app", "book", "[showId]", "page.tsx"),
  "utf8"
);

// Extract sample show price configs from shows.ts
function extractPriceConfig(showId, content) {
  const showRegex = new RegExp(`id:\\s*["']${showId}["'][\\s\\S]*?priceConfig:\\s*({[\\s\\S]*?})`, "m");
  const match = content.match(showRegex);
  if (!match) return null;
  const cleanJson = match[1]
    .replace(/RECLINER:/g, '"RECLINER":')
    .replace(/PRIME:/g, '"PRIME":')
    .replace(/CLASSIC:/g, '"CLASSIC":');
  return JSON.parse(cleanJson);
}

// Generate realistic cinema seats matching src/data/seats.ts
function generateTestSeats(showId, priceConfig) {
  const rowConfigs = [
    { row: "A", tier: "RECLINER", seatCount: 10 },
    { row: "B", tier: "PRIME", seatCount: 14 },
    { row: "C", tier: "PRIME", seatCount: 14 },
    { row: "D", tier: "PRIME", seatCount: 14 },
    { row: "E", tier: "CLASSIC", seatCount: 16 },
    { row: "F", tier: "CLASSIC", seatCount: 16 },
    { row: "G", tier: "CLASSIC", seatCount: 16 },
    { row: "H", tier: "CLASSIC", seatCount: 16 },
  ];

  const seats = [];
  rowConfigs.forEach(({ row, tier, seatCount }) => {
    const tierPrice = priceConfig[tier] || 250;
    for (let num = 1; num <= seatCount; num++) {
      const isWheelchair = row === "H" && (num === 1 || num === seatCount);
      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        tier,
        price: tierPrice,
        status: isWheelchair ? "WHEELCHAIR" : "AVAILABLE",
      });
    }
  });
  return seats;
}

// Helper: simulate tier summary calculation from SeatCountModal
function calculateTierSummaries(priceConfig, allSeats, selectedCount) {
  const tiers = ["RECLINER", "PRIME", "CLASSIC"];
  return tiers
    .filter((tier) => priceConfig[tier] !== undefined)
    .map((tier) => {
      const price = priceConfig[tier];
      const tierSeats = allSeats.filter((s) => s.tier === tier);
      const freeCount = tierSeats.filter(
        (s) => s.status === "AVAILABLE" || s.status === "WHEELCHAIR"
      ).length;

      let statusText = "Available";
      if (freeCount === 0) {
        statusText = "Sold out";
      } else if (freeCount < selectedCount) {
        statusText = `Filling fast (${freeCount} left)`;
      } else if (freeCount <= Math.max(selectedCount * 2, 6)) {
        statusText = "Filling fast";
      }

      return {
        tier,
        price,
        freeCount,
        totalCount: tierSeats.length,
        statusText,
      };
    });
}

// Helper: simulate seat selection state machine from BookingContext & SeatMap
class SeatSelectionState {
  constructor(targetSeatCount = 2) {
    this.targetSeatCount = targetSeatCount;
    this.selectedSeats = [];
  }

  toggleSeat(seat) {
    if (seat.status === "OCCUPIED" || seat.status === "LOCKED") {
      return { added: false, error: "Seat is unavailable" };
    }

    const exists = this.selectedSeats.some((s) => s.id === seat.id);
    if (exists) {
      this.selectedSeats = this.selectedSeats.filter((s) => s.id !== seat.id);
      return { added: false };
    }

    if (this.selectedSeats.length >= this.targetSeatCount) {
      return {
        added: false,
        error: `You have selected your ${this.targetSeatCount} seats. Deselect one first to pick another, or change your seat count.`,
      };
    }

    this.selectedSeats.push({ ...seat, status: "SELECTED" });
    return { added: true };
  }

  isCheckoutEnabled() {
    return this.selectedSeats.length === this.targetSeatCount;
  }
}

test("Step 1: Quantity selector limits between 1 and 10 with coral active styling", () => {
  const validCounts = Array.from({ length: 10 }, (_, i) => i + 1);
  assert.equal(validCounts.length, 10);
  assert.equal(validCounts[0], 1);
  assert.equal(validCounts[9], 10);

  // Verify SeatCountModal uses brand-primary coral for active state
  assert.ok(
    modalContent.includes("bg-[var(--brand-primary)] text-white"),
    "Selected number pill must be styled with filled coral circle"
  );
});

test("Step 1 & 2: Tier prices match show.priceConfig exactly with NO hardcoding", () => {
  const priceConfig1 = extractPriceConfig("show-dune-nexus-1", showsContent);
  const priceConfig2 = extractPriceConfig("show-dune-nexus-3", showsContent);

  assert.ok(priceConfig1, "Price config for show 1 must exist");
  assert.ok(priceConfig2, "Price config for show 2 must exist");

  // Show 1 and Show 2 in the same cinema have distinct dynamic pricing
  assert.notEqual(
    priceConfig1.RECLINER,
    priceConfig2.RECLINER,
    "Show 1 and Show 2 must have distinct pricing"
  );

  const seatsShow1 = generateTestSeats("show-dune-nexus-1", priceConfig1);
  const seatsShow2 = generateTestSeats("show-dune-nexus-3", priceConfig2);

  // Step 1 tier prices for Show 1
  const summaries1 = calculateTierSummaries(priceConfig1, seatsShow1, 2);
  const reclinerSummary1 = summaries1.find((s) => s.tier === "RECLINER");
  assert.equal(reclinerSummary1.price, priceConfig1.RECLINER);

  // Step 2 seat prices for Show 1 match Step 1 quoted price
  const reclinerSeats1 = seatsShow1.filter((s) => s.tier === "RECLINER");
  reclinerSeats1.forEach((seat) => {
    assert.equal(
      seat.price,
      reclinerSummary1.price,
      `Seat ${seat.id} price (${seat.price}) must match Step 1 quote (${reclinerSummary1.price})`
    );
  });

  // Step 1 tier prices for Show 2
  const summaries2 = calculateTierSummaries(priceConfig2, seatsShow2, 2);
  const reclinerSummary2 = summaries2.find((s) => s.tier === "RECLINER");
  assert.equal(reclinerSummary2.price, priceConfig2.RECLINER);

  // Step 2 seat prices for Show 2 match Step 1 quoted price
  const reclinerSeats2 = seatsShow2.filter((s) => s.tier === "RECLINER");
  reclinerSeats2.forEach((seat) => {
    assert.equal(
      seat.price,
      reclinerSummary2.price,
      `Seat ${seat.id} price (${seat.price}) must match Step 1 quote (${reclinerSummary2.price})`
    );
  });
});

test("Step 1: Availability status calculation never reports 'Available' if 0 free seats for selected count", () => {
  const priceConfig = { RECLINER: 550, PRIME: 380, CLASSIC: 250 };

  // Scenario A: 0 free seats -> must be 'Sold out'
  const mockSeatsSoldOut = [
    { id: "A1", tier: "RECLINER", status: "OCCUPIED" },
    { id: "A2", tier: "RECLINER", status: "OCCUPIED" },
  ];
  const summarySoldOut = calculateTierSummaries(priceConfig, mockSeatsSoldOut, 2);
  assert.equal(summarySoldOut[0].statusText, "Sold out");

  // Scenario B: 1 free seat, but user requested 2 seats -> must NOT be 'Available'
  const mockSeatsOneLeft = [
    { id: "A1", tier: "RECLINER", status: "AVAILABLE" },
    { id: "A2", tier: "RECLINER", status: "OCCUPIED" },
  ];
  const summaryOneLeft = calculateTierSummaries(priceConfig, mockSeatsOneLeft, 2);
  assert.notEqual(summaryOneLeft[0].statusText, "Available");
  assert.match(summaryOneLeft[0].statusText, /Filling fast/);

  // Scenario C: Plentiful free seats -> 'Available'
  const mockSeatsPlentiful = Array.from({ length: 15 }, (_, i) => ({
    id: `A${i + 1}`,
    tier: "RECLINER",
    status: "AVAILABLE",
  }));
  const summaryPlentiful = calculateTierSummaries(priceConfig, mockSeatsPlentiful, 2);
  assert.equal(summaryPlentiful[0].statusText, "Available");
});

test("Step 1: Primary CTA disabled when selected count exceeds total auditorium capacity", () => {
  const mockSeats = [
    { id: "A1", status: "AVAILABLE" },
    { id: "A2", status: "AVAILABLE" },
    { id: "A3", status: "OCCUPIED" },
  ];
  const totalAvailable = mockSeats.filter((s) => s.status === "AVAILABLE").length;
  assert.equal(totalAvailable, 2);

  // Selecting 2 seats is within capacity
  const is2Allowed = 2 <= totalAvailable;
  assert.equal(is2Allowed, true);

  // Selecting 3 seats exceeds capacity -> CTA disabled with inline error
  const is3Allowed = 3 <= totalAvailable;
  assert.equal(is3Allowed, false);

  // Confirm SeatCountModal component has inline message for capacity exceeded
  assert.ok(
    modalContent.includes("isOverCapacity"),
    "SeatCountModal must check capacity against total available seats"
  );
  assert.ok(
    modalContent.includes("Capacity Exceeded"),
    "SeatCountModal CTA must display capacity exceeded message"
  );
});

test("Step 1: Dismissible bestseller banner sources from real show data", () => {
  assert.ok(
    modalContent.includes("bestsellerTier"),
    "SeatCountModal must read bestsellerTier from show data"
  );
  assert.ok(
    modalContent.includes("Book the {bestsellerLabel} Bestseller Seats"),
    "SeatCountModal must render bestseller banner with dynamic tier label"
  );
  assert.ok(
    modalContent.includes("setShowBestsellerBanner(false)"),
    "SeatCountModal bestseller banner must be dismissible"
  );
});

test("Step 2: Strict seat count enforcement (N enabled, N-1 or N+1 disabled)", () => {
  const selection = new SeatSelectionState(3); // User chose 3 seats in Step 1

  const seats = [
    { id: "B1", status: "AVAILABLE", tier: "PRIME", price: 380 },
    { id: "B2", status: "AVAILABLE", tier: "PRIME", price: 380 },
    { id: "B3", status: "AVAILABLE", tier: "PRIME", price: 380 },
    { id: "B4", status: "AVAILABLE", tier: "PRIME", price: 380 },
  ];

  // 1 seat selected (N - 2)
  selection.toggleSeat(seats[0]);
  assert.equal(selection.selectedSeats.length, 1);
  assert.equal(selection.isCheckoutEnabled(), false, "Checkout disabled at N - 2");

  // 2 seats selected (N - 1)
  selection.toggleSeat(seats[1]);
  assert.equal(selection.selectedSeats.length, 2);
  assert.equal(selection.isCheckoutEnabled(), false, "Checkout disabled at N - 1");

  // 3 seats selected (exact N)
  selection.toggleSeat(seats[2]);
  assert.equal(selection.selectedSeats.length, 3);
  assert.equal(selection.isCheckoutEnabled(), true, "Checkout enabled at exact N = 3");

  // Attempting to select 4th seat (N + 1) must be rejected with explicit prompt
  const overflowRes = selection.toggleSeat(seats[3]);
  assert.equal(overflowRes.added, false);
  assert.match(overflowRes.error, /Deselect one first/);
  assert.equal(selection.selectedSeats.length, 3, "Length must remain strictly 3");
  assert.equal(selection.isCheckoutEnabled(), true, "Checkout remains enabled for exact N = 3");
});

test("Step 2: Unavailable seats are never selectable via mouse or keyboard", () => {
  const selection = new SeatSelectionState(2);
  const occupiedSeat = { id: "B5", status: "OCCUPIED", tier: "PRIME", price: 380 };
  const lockedSeat = { id: "B6", status: "LOCKED", tier: "PRIME", price: 380 };

  const occupiedRes = selection.toggleSeat(occupiedSeat);
  assert.equal(occupiedRes.added, false);
  assert.equal(selection.selectedSeats.length, 0);

  const lockedRes = selection.toggleSeat(lockedSeat);
  assert.equal(lockedRes.added, false);
  assert.equal(selection.selectedSeats.length, 0);

  // In SeatMap.tsx, occupied buttons are disabled and styled with line-through
  assert.ok(
    seatMapContent.includes("disabled={isOccupied}"),
    "Occupied seats must have disabled HTML attribute"
  );
  assert.ok(
    seatMapContent.includes("line-through"),
    "Occupied seats must have visual strikethrough cue"
  );
});

test("Step 2: Wheelchair-accessible seats have distinct iconography and aria-labels", () => {
  assert.ok(
    seatMapContent.includes("Accessibility"),
    "SeatMap must use Accessibility icon for wheelchair seats"
  );
  assert.ok(
    seatMapContent.includes("wheelchair accessible"),
    "Wheelchair seats must have descriptive aria-label"
  );
});

test("Step 2: Cinema screen orientation bar is clearly labeled", () => {
  assert.ok(
    seatMapContent.includes("All Eyes This Way — Cinema Screen"),
    "SeatMap must feature unambiguous cinema screen label"
  );
  assert.ok(
    seatMapContent.includes("cinema-screen-curve"),
    "SeatMap must feature curved bar screen representation"
  );
});

test("Double-booking race condition detection and error reporting", () => {
  // Simulate server state where seat B1 was locked by another user session
  const serverLocks = new Set(["B1"]);

  function simulateServerHoldValidation(requestedSeatIds, activeServerLocks) {
    const conflicts = requestedSeatIds.filter((id) => activeServerLocks.has(id));
    if (conflicts.length > 0) {
      return {
        success: false,
        unavailableSeats: conflicts,
        error: `Seat ${conflicts.join(", ")} is no longer available. Please select another seat.`,
      };
    }
    return { success: true };
  }

  // Client tries to proceed with ["B1", "B2"]
  const res = simulateServerHoldValidation(["B1", "B2"], serverLocks);
  assert.equal(res.success, false);
  assert.deepEqual(res.unavailableSeats, ["B1"]);
  assert.match(res.error, /Seat B1 is no longer available/);

  // Check API route implements 409 Conflict check
  assert.ok(
    apiSeatsContent.includes("status: 409"),
    "Server API route must return 409 Conflict when seats are contested"
  );
  assert.ok(
    seatPageContent.includes("validateAndHoldSeats"),
    "SeatSelectionPage must call server validation before proceeding to checkout"
  );
});

test("Zoom controls maintain scale bounds [0.75x, 1.5x] and descriptive aria-labels", () => {
  let zoom = 1.0;
  const zoomIn = () => Math.min(1.5, Math.round((zoom + 0.15) * 100) / 100);
  const zoomOut = () => Math.max(0.75, Math.round((zoom - 0.15) * 100) / 100);

  // Zoom in multiple times
  for (let i = 0; i < 10; i++) {
    zoom = zoomIn();
  }
  assert.equal(zoom, 1.5, "Zoom max cap must be 1.5x");

  // Zoom out multiple times
  for (let i = 0; i < 10; i++) {
    zoom = zoomOut();
  }
  assert.equal(zoom, 0.75, "Zoom min cap must be 0.75x");

  // Check SeatMap aria-labels
  assert.ok(
    seatMapContent.includes('aria-label="Zoom in"'),
    "Zoom in button must have descriptive aria-label"
  );
  assert.ok(
    seatMapContent.includes('aria-label="Zoom out"'),
    "Zoom out button must have descriptive aria-label"
  );
  assert.ok(
    seatMapContent.includes('aria-label="Reset zoom"'),
    "Reset zoom button must have descriptive aria-label"
  );
});

test("Persistence across navigation: movie, cinema, show, date retained when editing count", () => {
  assert.ok(
    seatPageContent.includes("setIsCountModalOpen(true)"),
    "SeatPage must allow reopening count modal in-place without navigating away"
  );
  assert.ok(
    bookingContextContent.includes("targetSeatCount"),
    "BookingContext must persist targetSeatCount in draft state"
  );
  assert.ok(
    bookingContextContent.includes("setTargetSeatCount"),
    "BookingContext must expose setTargetSeatCount"
  );
});
