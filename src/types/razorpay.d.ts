export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    /**
     * Pre-selects/opens the given tab in Razorpay Checkout. This only sets
     * the tab Checkout opens on -- it does not restrict or lock the payer
     * to that method; Razorpay's own modal still lets them switch tabs.
     */
    method?: "card" | "netbanking" | "wallet" | "emi" | "upi";
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: {
      new (options: RazorpayOptions): RazorpayInstance;
    };
  }
}
