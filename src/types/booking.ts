export type SeatTier = "RECLINER" | "PRIME" | "CLASSIC";

export type SeatStatus = "AVAILABLE" | "SELECTED" | "OCCUPIED" | "LOCKED" | "WHEELCHAIR";

export interface Seat {
  id: string; // e.g. "A1", "C12"
  row: string; // "A", "B", etc.
  number: number; // 1, 2, 3...
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  isAisleRight?: boolean;
}

export interface ShowPriceConfig {
  [key: string]: number; // e.g. RECLINER: 480, PRIME: 320, CLASSIC: 220
}

export interface Show {
  id: string;
  movieId: string;
  cinemaId: string;
  screenId: string;
  screenName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "14:30"
  endTime: string; // "17:15"
  language: string;
  format: string; // "IMAX 2D", "3D", "2D"
  priceConfig: ShowPriceConfig;
  cancellationCutoffHours: number; // e.g. 2 hours before show
  bestsellerTier?: SeatTier;
  maxSeatsPerBooking?: number;
}

export type TierAvailabilityStatus = "AVAILABLE" | "FILLING_FAST" | "SOLD_OUT";

export interface SeatTierDetails {
  tier: SeatTier;
  label: string;
  price: number;
  availableCount: number;
  totalCount: number;
  status: TierAvailabilityStatus;
}

export type BookingStatus =
  | "INITIATED"
  | "SEATS_HELD"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentMethod = "UPI" | "CARD" | "NETBANKING";

export interface BookingFeeBreakdown {
  ticketSubtotal: number;
  convenienceFeePerTicket: number;
  totalConvenienceFee: number;
  taxGst: number; // 18% on convenience fee
  discount: number;
  totalAmount: number;
}

export interface Booking {
  id: string; // e.g. "SHW-84920"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  showId: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  cinemaAddress: string;
  screenName: string;
  date: string;
  startTime: string;
  format: string;
  language: string;
  seats: Seat[];
  pricing: BookingFeeBreakdown;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentTransactionId: string;
  qrCodeData: string;
  createdAt: string;
  expiresAt?: string; // For seat locks (8 mins)
}
