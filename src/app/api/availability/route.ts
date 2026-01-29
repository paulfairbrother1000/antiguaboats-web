import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Slot = "FD" | "AM" | "PM" | "SS";
const ALL_SLOTS: Slot[] = ["FD", "AM", "PM", "SS"];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toSlot(slug: unknown): Slot | undefined {
  if (typeof slug !== "string") return undefined;
  const s = slug.trim().toUpperCase();
  return s === "FD" || s === "AM" || s === "PM" || s === "SS" ? (s as Slot) : undefined;
}

function computeAvailable(booked: Slot[]): Slot[] {
  const has = (s: Slot) => booked.includes(s);

  // Full day booked blocks everything
  if (has("FD")) return [];

  // If anything is booked, you can never sell a Full Day
  const anyHalfOrSunsetBooked = has("AM") || has("PM") || has("SS");

  // If AM+PM or AM+SS combos are already booked, sold out
  if (has("AM") && has("PM")) return [];
  if (has("AM") && has("SS")) return [];

  // PM booked => only AM can be sold
  if (has("PM")) return has("AM") ? [] : ["AM"];

  // SS booked => only AM can be sold
  if (has("SS")) return has("AM") ? [] : ["AM"];

  // AM booked => can sell PM or SS (not FD)
  if (has("AM")) return ["PM", "SS"];

  // Nothing booked => everything available
  if (!anyHalfOrSunsetBooked) return ["FD", "AM", "PM", "SS"];

  // Fallback (shouldn't happen)
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to parameters are required" }, { status: 400 });
  }

  // Build date list (inclusive)
  const days: string[] = [];
  let cursor = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (cursor <= end) {
    days.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Fetch bookings in range (ignore cancelled)
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        start_at,
        status,
        charter_types ( slug )
      `
    )
    .gte("start_at", from + "T00:00:00Z")
    .lte("start_at", to + "T23:59:59Z")
    .not("status", "eq", "CANCELLED");

  if (error) {
    console.error("availability fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  const byDate = new Map<string, { booked: Slot[] }>();

  for (const b of (data ?? []) as any[]) {
    const date = isoDate(new Date(b.start_at));

    // Relationship can be object or array depending on Supabase typing
    const ct = b.charter_types;
    const slugRaw = Array.isArray(ct) ? ct?.[0]?.slug : ct?.slug;

    const slot = toSlot(slugRaw);
    if (!slot) continue;

    if (!byDate.has(date)) byDate.set(date, { booked: [] });
    byDate.get(date)!.booked.push(slot);
  }

  const result = days.map((date) => {
    const booked = byDate.get(date)?.booked ?? [];
    const available = computeAvailable(booked);

    return {
      date,
      booked,
      available,
      sold_out: available.length === 0,
    };
  });

  return NextResponse.json(result);
}
