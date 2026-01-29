import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  if (!date) {
    return NextResponse.json({ error: "Missing query param: date=YYYY-MM-DD" }, { status: 400 });
  }

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEndExclusive = new Date(`${date}T00:00:00.000Z`);
  dayEndExclusive.setUTCDate(dayEndExclusive.getUTCDate() + 1);
  const dayEnd = dayEndExclusive.toISOString();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id,status,start_at,end_at,total_amount_cents,currency,charter_types(slug,title,slot_mode)"
    )
    .gte("start_at", dayStart)
    .lt("start_at", dayEnd)
    .in("status", ["HOLD", "CONFIRMED", "CANCELLED"])
    .order("start_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
