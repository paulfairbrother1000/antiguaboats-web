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
  return (s === "FD" || s === "AM" || s === "PM" || s === "SS") ? (s as Slot) : undefined;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to parameters are required" },
      { status: 400 }
    );
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

    // Supabase TS sometimes types relationships as arrays. Support both.
    const ct = b.charter_types;
    const slugRaw =
      Array.isArray(ct) ? ct?.[0]?.slug : ct?.slug;

    const slot = toSlot(slugRaw);
    if (!slot) continue;

    if (!byDate.has(date)) byDate.set(date, { booked: [] });
    byDate.get(date)!.booked.push(slot);
  }

  // Apply booking rules per day
  const result = days.map((date) => {
    const booked = byDate.get(date)?.booked ?? [];
    let available: Slot[] = [...ALL_SLOTS];

    // Full day blocks everything
    if (booked.includes("FD")) {
      available = [];
    } else {
      if (booked.includes("AM")) available = available.filter((s) => s !== "AM");
      if (booked.includes("PM")) available = available.filter((s) => s !== "PM");
      if (booked.includes("SS")) available = available.filter((s) => s !== "SS");
    }

    return {
      date,
      booked,
      available,
      sold_out: available.length === 0,
    };
  });

  return NextResponse.json(result);
}
