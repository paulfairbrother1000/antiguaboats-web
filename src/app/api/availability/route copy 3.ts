import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Slot = "FD" | "SHARED_FD" | "AM" | "PM" | "SS";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toSlot(slug: unknown): Slot | undefined {
  if (typeof slug !== "string") return undefined;

  const s = slug.trim().toLowerCase();

  if (s === "day" || s === "fd" || s === "full-day") return "FD";
  if (s === "full-day-shared" || s === "shared-fd" || s === "shared_fd") return "SHARED_FD";
  if (s === "am" || s === "half-day-am") return "AM";
  if (s === "pm" || s === "half-day-pm") return "PM";
  if (s === "ss" || s === "sunset" || s === "sunset-cruise") return "SS";

  return undefined;
}

function computeAvailable(booked: Slot[]): Slot[] {
  const has = (s: Slot) => booked.includes(s);
  const sharedCount = booked.filter((s) => s === "SHARED_FD").length;

  // Private full day blocks everything
  if (has("FD")) return [];

  // Shared full day logic:
  // 1 booking = second shared place still available
  // 2 bookings = sold out
  if (sharedCount >= 2) return [];
  if (sharedCount === 1) return ["SHARED_FD"];

  // If any half day/sunset is booked, shared/full day can't be sold
  if (has("AM") && has("PM")) return [];
  if (has("AM") && has("SS")) return [];

  if (has("PM")) return ["AM"];
  if (has("SS")) return ["AM"];
  if (has("AM")) return ["PM", "SS"];

  // Nothing booked = all options available, including shared full day
  return ["FD", "AM", "PM", "SS", "SHARED_FD"];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to parameters are required" }, { status: 400 });
  }

  const days: string[] = [];
  let cursor = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");

  while (cursor <= end) {
    days.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

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