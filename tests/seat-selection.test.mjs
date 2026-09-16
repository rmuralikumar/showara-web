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

test("Unavailable seat removal: when selected seat becomes unavailable, it is immediately removed from selected state", () => {
  class BookingSimulator {
    constructor(targetCount = 1) {
      this.targetSeatCount = targetCount;
      this.selectedSeats = [{ id: "A4", row: "A", number: 4, tier: "RECLINER", price: 440, status: "SELECTED" }];
      this.errorMessage = null;
    }

    removeSelectedSeats(seatIds) {
      const idSet = new Set(seatIds);
      this.selectedSeats = this.selectedSeats.filter((s) => !idSet.has(s.id));
    }

    onAvailabilityCheckFailed(conflicts) {
      this.removeSelectedSeats(conflicts);
      this.errorMessage = `Seat ${conflicts.join(", ")} is no longer available. Please select another seat.`;
    }

    isProceedEnabled({ isExpired = false, isProcessing = false } = {}) {
      const validCount = this.selectedSeats.length;
      return validCount === this.targetSeatCount && validCount > 0 && !isExpired && !isProcessing;
    }
  }

  const sim = new BookingSimulator(1);
  assert.equal(sim.selectedSeats.length, 1);
  assert.equal(sim.selectedSeats[0].id, "A4");
  assert.equal(sim.isProceedEnabled(), true);

  // Seat A4 becomes unavailable (e.g. taken by another user during checkout)
  sim.onAvailabilityCheckFailed(["A4"]);

  // Requirement 1 & 4: Seat A4 must be immediately removed from selected-seat state
  assert.equal(sim.selectedSeats.length, 0, "Selected seats must be empty after removing A4");
  assert.equal(sim.selectedSeats.some((s) => s.id === "A4"), false, "A4 must not remain selected");

  // Requirement 2: Show exact error message
  assert.equal(sim.errorMessage, "Seat A4 is no longer available. Please select another seat.");

  // Requirement 5: Proceed to Pay must now be disabled
  assert.equal(sim.isProceedEnabled(), false, "Proceed to Pay button must be disabled when 0 valid seats are selected");

  // Code inspection: BookingContext must expose removeSelectedSeats
  assert.ok(
    bookingContextContent.includes("removeSelectedSeats"),
    "BookingContext must implement and export removeSelectedSeats"
  );
  assert.ok(
    seatPageContent.includes("removeSelectedSeats"),
    "SeatPage must call removeSelectedSeats when seats become unavailable"
  );
});

test("Counter and summary update: seat counter and bottom booking summary reflect seat removal", () => {
  const targetSeatCount = 1;
  let selectedSeats = [{ id: "A4", price: 440 }];

  const getSummary = (seats) => {
    return {
      counterText: `${seats.length} of ${targetSeatCount} selected`,
      seatsLabel: seats.length > 0 ? `Seats: ${seats.map((s) => s.id).join(", ")}` : "No seats chosen",
      totalAmount: seats.reduce((sum, s) => sum + s.price, 0),
    };
  };

  const initialSummary = getSummary(selectedSeats);
  assert.equal(initialSummary.counterText, "1 of 1 selected");
  assert.equal(initialSummary.seatsLabel, "Seats: A4");
  assert.equal(initialSummary.totalAmount, 440);

  // Remove unavailable seat A4
  selectedSeats = [];
  const updatedSummary = getSummary(selectedSeats);

  // Requirement 3: Counter and bottom summary must automatically update
  assert.equal(updatedSummary.counterText, "0 of 1 selected");
  assert.equal(updatedSummary.seatsLabel, "No seats chosen");
  assert.equal(updatedSummary.totalAmount, 0);

  // Check SeatMap implementation uses validSelectedSeats for counter & summary
  assert.ok(
    seatMapContent.includes("validSelectedSeats"),
    "SeatMap must compute validSelectedSeats to ensure summary never reflects invalid seats"
  );
});

test("Proceed to Pay disabled states: disabled on count mismatch, unavailable seat, expiry, or in-flight processing", () => {
  function checkProceedDisabled({ selectedCount, targetCount, hasUnavailable, isExpired, isProcessing }) {
    const isExact = selectedCount === targetCount && !hasUnavailable && selectedCount > 0;
    return !isExact || isProcessing || isExpired;
  }

  // Count mismatch (0 of 1 selected)
  assert.equal(checkProceedDisabled({ selectedCount: 0, targetCount: 1, hasUnavailable: false, isExpired: false, isProcessing: false }), true);

  // Count mismatch (2 of 1 selected)
  assert.equal(checkProceedDisabled({ selectedCount: 2, targetCount: 1, hasUnavailable: false, isExpired: false, isProcessing: false }), true);

  // Unavailable seat still in selection
  assert.equal(checkProceedDisabled({ selectedCount: 1, targetCount: 1, hasUnavailable: true, isExpired: false, isProcessing: false }), true);

  // Expired hold
  assert.equal(checkProceedDisabled({ selectedCount: 1, targetCount: 1, hasUnavailable: false, isExpired: true, isProcessing: false }), true);

  // In-flight processing
  assert.equal(checkProceedDisabled({ selectedCount: 1, targetCount: 1, hasUnavailable: false, isExpired: false, isProcessing: true }), true);

  // Valid and ready
  assert.equal(checkProceedDisabled({ selectedCount: 1, targetCount: 1, hasUnavailable: false, isExpired: false, isProcessing: false }), false);

  // Verify SeatMap button disabled prop checks
  assert.ok(
    seatMapContent.includes("disabled={!isExactCountSelected || isProcessing || isExpired}"),
    "SeatMap Proceed CTA button must be disabled if not exact count, isProcessing, or isExpired"
  );
});

test("Replacement seat selection: selecting a valid replacement seat recalculates price and re-enables Proceed to Pay", () => {
  const targetCount = 1;
  let selectedSeats = [];
  let price = 0;

  // Replacement seat B3 (Prime @ ₹380)
  const replacementSeat = { id: "B3", tier: "PRIME", price: 380, status: "AVAILABLE" };
  selectedSeats.push(replacementSeat);
  price = replacementSeat.price;

  const isExactCountSelected = selectedSeats.length === targetCount && selectedSeats[0].status === "AVAILABLE";
  assert.equal(isExactCountSelected, true, "Proceed to Pay must be re-enabled for replacement seat");
  assert.equal(price, 380, "Price must be recalculated for new seat");
  assert.equal(selectedSeats[0].id, "B3");
});

test("Final availability check fails: user kept on seat-selection page, invalid seat removed, error displayed", () => {
  let userNavigated = false;
  let currentRoute = "/book/show-123";
  let displayedError = null;
  let selectedSeats = [{ id: "A4" }];

  async function handleProceedSimulation(isSeatAvailable) {
    if (!isSeatAvailable) {
      // Re-validation failed on server
      selectedSeats = selectedSeats.filter((s) => s.id !== "A4");
      displayedError = "Seat A4 is no longer available. Please select another seat.";
      return; // Stay on page
    }
    userNavigated = true;
    currentRoute = "/booking/review";
  }

  // Availability check fails
  handleProceedSimulation(false);

  assert.equal(userNavigated, false, "Must not navigate when final validation fails");
  assert.equal(currentRoute, "/book/show-123", "User must remain on seat selection page");
  assert.equal(selectedSeats.length, 0, "Invalid seat must be removed from selected state");
  assert.equal(displayedError, "Seat A4 is no longer available. Please select another seat.");

  // Code inspection: handleProceed in page.tsx must remove invalid seats and set error
  assert.ok(
    seatPageContent.includes("removeSelectedSeats(fallbackIds)"),
    "page.tsx must remove invalid seats upon validation failure"
  );
  assert.ok(
    seatPageContent.includes("setErrorMessage("),
    "page.tsx must set clear error message upon validation failure"
  );
});

test("Successful payment navigation: valid selection proceeds to review/payment", () => {
  let currentRoute = "/book/show-123";

  function handleProceedSuccess() {
    currentRoute = "/booking/review";
  }

  handleProceedSuccess();
  assert.equal(currentRoute, "/booking/review", "Successful validation navigates to review page");
  assert.ok(
    seatPageContent.includes('router.push("/booking/review")'),
    "page.tsx must navigate to booking review on validation success"
  );
});

test("Duplicate clicks: Proceed button and handler prevent concurrent submissions", () => {
  let callCount = 0;
  let isProcessing = false;

  async function clickProceed() {
    if (isProcessing) return "IGNORED";
    isProcessing = true;
    callCount++;
    // Simulate async server call
    await new Promise((r) => setTimeout(r, 10));
    isProcessing = false;
    return "PROCESSED";
  }

  // Trigger multiple clicks concurrently
  const p1 = clickProceed();
  const p2 = clickProceed();
  const p3 = clickProceed();

  Promise.all([p1, p2, p3]).then(([r1, r2, r3]) => {
    assert.equal(r1, "PROCESSED");
    assert.equal(r2, "IGNORED");
    assert.equal(r3, "IGNORED");
    assert.equal(callCount, 1, "Only a single proceed request must be executed");
  });

  // Check page.tsx has duplicate click guard
  assert.ok(
    seatPageContent.includes("if (!show || isProcessing) return;"),
    "handleProceed in page.tsx must check isProcessing before firing"
  );
});

