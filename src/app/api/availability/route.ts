import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Slot = "FD" | "AM" | "PM" | "SS";

const ALL_SLOTS: Slot[] = ["FD", "AM", "PM", "SS"];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

/**
 * Availability rules you defined:
 * Allowed sets per day:
 * - FD only
 * - AM + PM
 * - AM + SS
 */
function computeAvailable(booked: Slot[]): Slot[] {
  const set = new Set(booked);

  if (set.has("FD")) return [];

  // booked combos that fully consume day
  if (set.has("AM") && set.has("PM")) return [];
  if (set.has("AM") && set.has("SS")) return [];

  // single bookings
  if (set.size === 0) return [...ALL_SLOTS];
  if (set.has("AM")) return ["PM", "SS"];
  if (set.has("PM")) return ["AM"];
  if (set.has("SS")) return ["AM"];

  // unknown/unexpected combo: be safe and return none
  return [];
}

function toSlot(value: any): Slot | null {
  if (value === "FD" || value === "AM" || value === "PM" || value === "SS") return value;
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from"); // YYYY-MM-DD
  const to = url.searchParams.get("to"); // YYYY-MM-DD

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing query params: from=YYYY-MM-DD&to=YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Build an inclusive range of dates
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return NextResponse.json({ error: "Invalid from/to date range" }, { status: 400 });
  }

  // Use UTC timestamps for filtering bookings by start_at
  const fromTs = `${from}T00:00:00.000Z`;
  const toExclusive = isoDate(addDays(toDate, 1)) + "T00:00:00.000Z";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
  );

  // Pull HOLD + CONFIRMED bookings in range, join charter_types to read slot_mode
  const { data, error } = await supabase
    .from("bookings")
    .select("start_at,status,charter_types(slot_mode,slug)")
    .gte("start_at", fromTs)
    .lt("start_at", toExclusive)
    .in("status", ["HOLD", "CONFIRMED"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group booked slots by day (UTC day of start_at)
  const bookedByDay = new Map<string, Slot[]>();

  for (const row of data ?? []) {
    const startAt = row.start_at as string;
    const day = startAt.slice(0, 10); // ISO date portion in UTC if stored as Z
    const ct = (row as any).charter_types;

    const slot = toSlot(ct?.slot_mode);
    if (!slot) continue;

    const arr = bookedByDay.get(day) ?? [];
    arr.push(slot);
    bookedByDay.set(day, arr);
  }

  // Create response for every day in the range (even if no bookings)
  const out: { date: string; booked: Slot[]; available: Slot[]; sold_out: boolean }[] = [];

  for (let d = fromDate; d <= toDate; d = addDays(d, 1)) {
    const day = isoDate(d);
    const booked = Array.from(new Set(bookedByDay.get(day) ?? [])) as Slot[];
    const available = computeAvailable(booked);
    out.push({ date: day, booked, available, sold_out: available.length === 0 });
  }

  return NextResponse.json(out);
}
