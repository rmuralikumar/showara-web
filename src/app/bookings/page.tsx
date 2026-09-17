import { redirect } from "next/navigation";

export default function BookingsRedirectPage() {
  redirect("/account/bookings");
}
