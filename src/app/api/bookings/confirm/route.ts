import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const bookingId = String(body.booking_id || "");
  if (!bookingId) return NextResponse.json({ error: "booking_id required" }, { status: 400 });

  const supa = sbServer();

  const { data: booking, error: getErr } = await supa
    .from("bookings")
    .select("id,status,hold_expires_at")
    .eq("id", bookingId)
    .single();

  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 500 });

  if (booking.status !== "HOLD") {
    return NextResponse.json({ error: `Cannot confirm from status ${booking.status}` }, { status: 400 });
  }

  if (booking.hold_expires_at && Date.parse(booking.hold_expires_at) < Date.now()) {
    return NextResponse.json({ error: "Hold expired" }, { status: 400 });
  }

  const { error: updErr } = await supa
    .from("bookings")
    .update({ status: "CONFIRMED", hold_expires_at: null, updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
