import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverPaymentStore } from "@/lib/serverPaymentStore";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Authentication required to access personal bookings." },
        { status: 401 }
      );
    }

    // Authoritative server-side query: strictly scoped to the authenticated user ID and email
    const bookings = serverPaymentStore.getBookingsForUser(userId || "", userEmail || undefined);

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (err: any) {
    console.error("API /api/user/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve user bookings." },
      { status: 500 }
    );
  }
}
