import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Slot = "FD" | "AM" | "PM" | "SS";

function isSlot(v: any): v is Slot {
  return v === "FD" || v === "AM" || v === "PM" || v === "SS";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const slot_mode = body?.slot_mode as Slot | undefined; // FD/AM/PM/SS
  const guests = Number(body?.guests);
  const nobu = Boolean(body?.nobu);

  if (!isSlot(slot_mode)) {
    return NextResponse.json({ error: "slot_mode must be one of FD, AM, PM, SS" }, { status: 400 });
  }
  if (!Number.isFinite(guests) || guests < 1 || guests > 8) {
    return NextResponse.json({ error: "guests must be 1–8" }, { status: 400 });
  }
  if (nobu && slot_mode !== "FD") {
    return NextResponse.json({ error: "nobu is only valid for FD" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get charter type by slot_mode
  const { data: ct, error: ctErr } = await supabase
    .from("charter_types")
    .select("id,title,base_price_cents,currency,slot_mode,active")
    .eq("slot_mode", slot_mode)
    .eq("active", true)
    .maybeSingle();

  if (ctErr) return NextResponse.json({ error: ctErr.message }, { status: 500 });
  if (!ct) return NextResponse.json({ error: "Charter type not found/active for slot_mode" }, { status: 404 });

  const { data: rules, error: rulesErr } = await supabase
    .from("pricing_rules")
    .select("code,amount_cents,threshold,max_value,applies_to_slot,active")
    .eq("active", true);

  if (rulesErr) return NextResponse.json({ error: rulesErr.message }, { status: 500 });

  const rule = (code: string) => (rules ?? []).find((r: any) => r.code === code);

  const breakdown: { label: string; amount_cents: number }[] = [];

  // Base
  breakdown.push({ label: ct.title, amount_cents: ct.base_price_cents });

  // Extra guests
  const extra = rule("EXTRA_GUEST");
  if (extra) {
    const threshold = Number(extra.threshold ?? 6);
    const maxValue = Number(extra.max_value ?? 8);
    const per = Number(extra.amount_cents ?? 0);

    if (guests > threshold) {
      const extraGuests = Math.min(guests, maxValue) - threshold;
      if (extraGuests > 0 && per > 0) {
        breakdown.push({
          label: `Extra guests (${extraGuests} × $${(per / 100).toFixed(0)})`,
          amount_cents: extraGuests * per,
        });
      }
    }
  }

  // Nobu surcharge
  if (nobu) {
    const nobuRule = rule("NOBU_FUEL");
    const applies = (nobuRule?.applies_to_slot ?? null) as Slot[] | null;
    const ok = !applies || applies.includes("FD");
    const amt = Number(nobuRule?.amount_cents ?? 0);

    if (ok && amt > 0) {
      breakdown.push({ label: "Nobu fuel surcharge", amount_cents: amt });
    }
  }

  const total_amount_cents = breakdown.reduce((sum, x) => sum + x.amount_cents, 0);

  return NextResponse.json({
    currency: ct.currency ?? "USD",
    breakdown,
    total_amount_cents,
  });
}
