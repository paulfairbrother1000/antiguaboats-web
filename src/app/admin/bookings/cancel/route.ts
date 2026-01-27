import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  const bookingId = String(form.get("bookingId") ?? "");
  const reason = String(form.get("reason") ?? "");

  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const supa = sbServer();

  const { data: booking } = await supa
    .from("bookings")
    .select("id,status,total_amount_cents")
    .eq("id", bookingId)
    .single();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Only CONFIRMED can be cancelled" }, { status: 409 });

  // Mock refund: mark pending and free slot immediately
  await supa
    .from("bookings")
    .update({
      status: "CANCELLED",
      cancelled_reason: reason || null,
      cancelled_at: new Date().toISOString(),
      refund_status: "pending",
      refund_amount_cents: booking.total_amount_cents,
    })
    .eq("id", bookingId);

  await supa.from("booking_events").insert({
    booking_id: bookingId,
    event_type: "cancelled",
    event_data: { refund: "mock_pending", reason },
  });

  // Redirect back to bookings list
  return NextResponse.redirect(new URL("/admin/bookings", req.url));
}
