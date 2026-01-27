import { NextResponse } from "next/server";
import { sbServer } from "@/lib/supabaseServer";
import { SLOT_DEFS, CharterSlug, SlotId, CHARTER_SLOTS } from "@/lib/slots";
import { toAntiguaISO, isoRangeOverlaps } from "@/lib/time";
import { fetchPaceBusyBlocks } from "@/lib/pace";

type ApiDay = {
  date: string;
  slots: { slotId: SlotId; label: string; start: string; end: string; available: boolean }[];
};

function eachDay(fromYYYYMMDD: string, toYYYYMMDD: string) {
  const out: string[] = [];
  const start = new Date(fromYYYYMMDD + "T00:00:00Z");
  const end = new Date(toYYYYMMDD + "T00:00:00Z");
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const charter = (url.searchParams.get("charter") ?? "day") as CharterSlug;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Restaurant shuttle has no fixed slots
  if (charter === "restaurant-shuttle") {
    const days: ApiDay[] = eachDay(from, to).map(date => ({ date, slots: [] }));
    return NextResponse.json({ days });
  }

  const supa = sbServer();

  // Pull AB bookings that overlap the whole range
  const rangeStartISO = toAntiguaISO(from, "00:00");
  const rangeEndISO = toAntiguaISO(to, "23:59");

  const { data: existing, error } = await supa
    .from("bookings")
    .select("id,start_at,end_at,status,hold_expires_at")
    .in("status", ["HOLD", "CONFIRMED"])
    .gte("end_at", rangeStartISO)
    .lte("start_at", rangeEndISO);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const abBlocks = (existing ?? [])
    .filter(b => b.status === "CONFIRMED" || (b.hold_expires_at && Date.parse(b.hold_expires_at) > now))
    .map(b => ({ start_at: b.start_at, end_at: b.end_at }));

  // Pace blocks (stubbed to empty right now)
  const paceBlocks = await fetchPaceBusyBlocks(rangeStartISO, rangeEndISO);

  const blocks = [
    ...abBlocks.map(b => ({ start_at: b.start_at, end_at: b.end_at, source: "ab" as const })),
    ...paceBlocks.map(b => ({ start_at: b.start_at, end_at: b.end_at, source: "pace" as const })),
  ];

  const allowed = CHARTER_SLOTS[charter];

  const days: ApiDay[] = eachDay(from, to).map(date => {
    const slots = allowed.map(slotId => {
      const def = SLOT_DEFS[slotId];
      const startISO = toAntiguaISO(date, def.start);
      const endISO = toAntiguaISO(date, def.end);

      const blocked = blocks.some(b => isoRangeOverlaps(startISO, endISO, b.start_at, b.end_at));

      return {
        slotId,
        label: def.label,
        start: def.start,
        end: def.end,
        available: !blocked,
      };
    });

    return { date, slots };
  });

  return NextResponse.json({ days });
}
