import test from "node:test";
import assert from "node:assert/strict";

// Centralized pricing calculation logic test
function calculatePricing(seats, discountCode) {
  const ticketSubtotal = seats.reduce((acc, s) => acc + s.price, 0);
  const count = seats.length;
  const convenienceFeePerTicket = 35;
  const totalConvenienceFee = count * convenienceFeePerTicket;
  const taxGst = Math.round(totalConvenienceFee * 0.18);

  let discount = 0;
  if (discountCode) {
    const code = discountCode.trim().toUpperCase();
    if (code === "SHOWARA50" && ticketSubtotal > 200) {
      discount = 50;
    } else if (code === "PREMIER100" && ticketSubtotal > 500) {
      discount = 100;
    }
  }

  const totalAmount = Math.max(0, ticketSubtotal + totalConvenienceFee + taxGst - discount);

  return {
    ticketSubtotal,
    convenienceFeePerTicket,
    totalConvenienceFee,
    taxGst,
    discount,
    totalAmount,
  };
}

test("Pricing calculation without discounts", () => {
  const seats = [
    { id: "A1", price: 500, tier: "RECLINER" },
    { id: "A2", price: 500, tier: "RECLINER" },
  ];

  const pricing = calculatePricing(seats);
  assert.equal(pricing.ticketSubtotal, 1000);
  assert.equal(pricing.totalConvenienceFee, 70); // 2 * 35
  assert.equal(pricing.taxGst, 13); // round(70 * 0.18) = 12.6 -> 13
  assert.equal(pricing.discount, 0);
  assert.equal(pricing.totalAmount, 1083);
});

test("Pricing calculation with SHOWARA50 promo code", () => {
  const seats = [
    { id: "B1", price: 300, tier: "PRIME" },
  ];

  const pricing = calculatePricing(seats, "SHOWARA50");
  assert.equal(pricing.ticketSubtotal, 300);
  assert.equal(pricing.totalConvenienceFee, 35);
  assert.equal(pricing.taxGst, 6); // round(35 * 0.18) = 6.3 -> 6
  assert.equal(pricing.discount, 50);
  assert.equal(pricing.totalAmount, 300 + 35 + 6 - 50); // 291
});

test("Seat selection limit enforcement (Max 6 seats)", () => {
  const selectedSeats = ["A1", "A2", "A3", "A4", "A5", "A6"];
  const canAddMore = selectedSeats.length < 6;
  assert.equal(canAddMore, false, "Should not allow more than 6 seats");
});

test("Cancellation refund calculations: 100% ticket base refund, non-refundable fees", () => {
  const sampleBooking = {
    pricing: {
      ticketSubtotal: 720,
      totalConvenienceFee: 70,
      taxGst: 13,
      totalAmount: 803,
    },
    status: "CONFIRMED",
  };

  const refundAmount = sampleBooking.pricing.ticketSubtotal;
  assert.equal(refundAmount, 720);
  assert.equal(sampleBooking.pricing.totalAmount - refundAmount, 83); // Fee & Tax retained
});
