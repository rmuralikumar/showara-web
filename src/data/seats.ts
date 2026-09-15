import { Seat, SeatTier, ShowPriceConfig } from "@/types/booking";

// Generate a standard realistic cinema seat grid
export function generateSeatMapForShow(showId: string, priceConfig: ShowPriceConfig): Seat[] {
  const seats: Seat[] = [];

  // Rows specification:
  // Row A: RECLINER (top row, luxury spacious)
  // Rows B, C, D: PRIME (club / executive rows)
  // Rows E, F, G, H: CLASSIC (standard rows)
  const rowConfigs: { row: string; tier: SeatTier; seatCount: number }[] = [
    { row: "A", tier: "RECLINER", seatCount: 10 },
    { row: "B", tier: "PRIME", seatCount: 14 },
    { row: "C", tier: "PRIME", seatCount: 14 },
    { row: "D", tier: "PRIME", seatCount: 14 },
    { row: "E", tier: "CLASSIC", seatCount: 16 },
    { row: "F", tier: "CLASSIC", seatCount: 16 },
    { row: "G", tier: "CLASSIC", seatCount: 16 },
    { row: "H", tier: "CLASSIC", seatCount: 16 },
  ];

  // Deterministic seeded pseudo-random occupied seats based on showId
  let seed = 0;
  for (let i = 0; i < showId.length; i++) {
    seed = (seed << 5) - seed + showId.charCodeAt(i);
    seed |= 0;
  }

  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  rowConfigs.forEach(({ row, tier, seatCount }) => {
    const tierPrice = priceConfig[tier] || 250;

    for (let num = 1; num <= seatCount; num++) {
      const isWheelchair = (row === "H" && (num === 1 || num === seatCount));
      const rand = pseudoRandom();
      // Occupied ~25-35% of seats
      const isOccupied = !isWheelchair && rand > 0.68;

      // Add aisle spacing after certain numbers
      const isAisleRight =
        tier === "RECLINER"
          ? num === 5
          : seatCount === 14
          ? num === 4 || num === 10
          : num === 4 || num === 12;

      seats.push({
        id: `${row}${num}`,
        row,
        number: num,
        tier,
        price: tierPrice,
        status: isWheelchair ? "WHEELCHAIR" : isOccupied ? "OCCUPIED" : "AVAILABLE",
        isAisleRight,
      });
    }
  });

  return seats;
}
