import test from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import jsQR from "jsqr";

test("Ticket QR generation: encodes booking ID and ticket information correctly", async () => {
  const mockBooking = {
    id: "SHW-78392",
    movieTitle: "Dune: Part Two",
    cinemaName: "PVR Cinemas, Forum Mall",
    screenName: "Screen 1 (IMAX)",
    date: "2026-09-20",
    startTime: "07:30 PM",
    seats: [{ id: "D12", price: 350 }, { id: "D13", price: 350 }],
    pricing: {
      totalAmount: 780,
    },
    paymentTransactionId: "TXN-RZP-987123",
  };

  const payload = JSON.stringify({
    app: "SHOWARA",
    id: mockBooking.id,
    movie: mockBooking.movieTitle,
    cinema: mockBooking.cinemaName,
    screen: mockBooking.screenName,
    date: mockBooking.date,
    time: mockBooking.startTime,
    seats: mockBooking.seats.map((s) => s.id),
    total: mockBooking.pricing.totalAmount,
    txn: mockBooking.paymentTransactionId,
    verifyUrl: `https://showara.com/booking/confirmation/${mockBooking.id}`,
  });

  // 1. Verify SVG generation
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  assert.ok(svg.startsWith("<svg"), "Output must be valid SVG element");
  assert.ok(svg.includes('shape-rendering="crispEdges"'), "SVG must have crispEdges for sharp rendering");
  assert.ok(svg.length > 500, "SVG must contain valid path/rect vector QR data");

  // 2. Verify bit matrix scanning via jsQR
  const qr = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const scale = 4;
  const margin = 4;
  const fullSize = (size + margin * 2) * scale;
  const rgba = new Uint8ClampedArray(fullSize * fullSize * 4);
  rgba.fill(255); // White background

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (qr.modules.get(r, c)) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const y = (r + margin) * scale + dy;
            const x = (c + margin) * scale + dx;
            const idx = (y * fullSize + x) * 4;
            rgba[idx] = 0; // Red
            rgba[idx + 1] = 0; // Green
            rgba[idx + 2] = 0; // Blue
            rgba[idx + 3] = 255; // Alpha
          }
        }
      }
    }
  }

  // Scan with camera decoder
  const decoded = jsQR(rgba, fullSize, fullSize);
  assert.ok(decoded, "QR code must be successfully detected and decoded by scanner");
  assert.equal(decoded.data, payload, "Decoded payload must match ticket payload exactly");

  const parsed = JSON.parse(decoded.data);
  assert.equal(parsed.id, "SHW-78392");
  assert.equal(parsed.movie, "Dune: Part Two");
  assert.deepEqual(parsed.seats, ["D12", "D13"]);
  assert.equal(parsed.verifyUrl, "https://showara.com/booking/confirmation/SHW-78392");
});
