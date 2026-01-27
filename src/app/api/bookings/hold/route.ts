import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabaseServer";
import { SLOT_DEFS, CharterSlug, SlotId, CHARTER_SLOTS } from "@/lib/slots";
import { toAntiguaISO } from "@/lib/time";

function holdMinutes() {
  const m = Number(process.env.HOLD_MINUTES ?? "15");
  return Number.isFinite(m) ? m : 15;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const charter = body.charter as CharterSlug;
  const date = body.date as string; // YYYY-MM-DD
  const slotId = body.slotId as SlotId;

  if (!charter || !date || !slotId) {
    return NextResponse.json({ error: "charter/date/slotId required" }, { status: 400 });
  }

  const allowed = CHARTER_SLOTS[charter]?.includes(slotId);
  if (!allowed) return NextResponse.json({ error: "Invalid slot for charter" }, { status: 400 });

  const def = SLOT_DEFS[slotId];
  const start_at = toAntiguaISO(date, def.start);
  const end_at = toAntiguaISO(date, def.end);

  const supa = sbServer();

  const { data: ct } = await supa
    .from("charter_types")
    .select("id,base_price_cents,currency")
    .eq("slug", charter)
    .maybeSingle();

  if (!ct) return NextResponse.json({ error: "Unknown charter type" }, { status: 400 });

  const hold_expires_at = new Date(Date.now() + holdMinutes() * 60 * 1000).toISOString();

  const { data, error } = await supa
    .from("bookings")
    .insert({
      charter_type_id: ct.id,
      start_at,
      end_at,
      status: "HOLD",
      hold_expires_at,
      total_amount_cents: ct.base_price_cents,
      currency: ct.currency ?? "USD",
      meta: { charter, date, slotId }, // handy debug
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookingId: data.id, hold_expires_at });
}
