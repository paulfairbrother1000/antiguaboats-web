import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Slot = "FD" | "SHARED_FD" | "AM" | "PM" | "SS";
type SharedFallbackChoice = "CANCEL_REFUND" | "HALF_DAY_AM" | "HALF_DAY_PM" | "FULL_DAY_UPGRADE";

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

function slotTimesUtc(dateISO: string, slot: Slot) {
  const [yStr, mStr, dStr] = dateISO.split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1;
  const d = Number(dStr);

  if (slot === "FD" || slot === "SHARED_FD") {
    return {
      start_at: new Date(Date.UTC(y, m, d, 10, 0, 0)).toISOString(),
      end_at: new Date(Date.UTC(y, m, d, 17, 0, 0)).toISOString(),
    };
  }

  if (slot === "AM") {
    return {
      start_at: new Date(Date.UTC(y, m, d, 10, 0, 0)).toISOString(),
      end_at: new Date(Date.UTC(y, m, d, 13, 0, 0)).toISOString(),
    };
  }

  if (slot === "PM") {
    return {
      start_at: new Date(Date.UTC(y, m, d, 14, 0, 0)).toISOString(),
      end_at: new Date(Date.UTC(y, m, d, 17, 0, 0)).toISOString(),
    };
  }

  return {
    start_at: new Date(Date.UTC(y, m, d, 16, 30, 0)).toISOString(),
    end_at: new Date(Date.UTC(y, m, d, 18, 30, 0)).toISOString(),
  };
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

async function getCharterType(slot: Slot) {
  const slotMode = slot === "SHARED_FD" ? "SHARED_FD" : slot;

  const { data, error } = await supabase
    .from("charter_types")
    .select("id,base_price_cents,currency")
    .eq("slot_mode", slotMode)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function resolveSharedFallbacks() {
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        charter_type_id,
        start_at,
        end_at,
        status,
        customer_email,
        total_amount_cents,
        currency,
        notes,
        shared_fallback_choice,
        contracted_shared_amount_cents,
        contracted_full_day_amount_cents,
        contracted_upgrade_balance_cents,
        charter_types ( slug, slot_mode )
      `
    )
    .eq("status", "CONFIRMED")
    .lte("start_at", cutoff)
    .not("shared_fallback_choice", "is", null);

  if (error) throw error;

  const sharedBookings = ((data ?? []) as any[]).filter((b) => {
    const ct = Array.isArray(b.charter_types) ? b.charter_types?.[0] : b.charter_types;
    return toSlot(ct?.slug) === "SHARED_FD" || ct?.slot_mode === "SHARED_FD";
  });

  const byDate = new Map<string, any[]>();
  for (const booking of sharedBookings) {
    const date = isoDate(new Date(booking.start_at));
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(booking);
  }

  for (const [date, bookings] of byDate.entries()) {
    if (bookings.length !== 1) continue;

    const booking = bookings[0];
    const choice = booking.shared_fallback_choice as SharedFallbackChoice | null;
    if (!choice) continue;

    const before = {
      charter_type_id: booking.charter_type_id,
      start_at: booking.start_at,
      end_at: booking.end_at,
      status: booking.status,
      total_amount_cents: booking.total_amount_cents,
      shared_fallback_choice: booking.shared_fallback_choice,
    };

    await supabase.from("booking_events").insert({
      booking_id: booking.id,
      event_type: "SHARED_FALLBACK_APPLIED",
      event_data: {
        choice,
        date,
        before,
        reason: "Only one Full Day Shared Charter booking remained inside 24 hours of departure",
      },
    });

    if (choice === "CANCEL_REFUND") {
      const refundAmount = Number(booking.total_amount_cents ?? 0);

      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          status: "CANCELLED",
          refund_status: "REFUNDED_MOCK",
          refund_amount_cents: refundAmount,
          cancelled_reason: "Shared charter fallback: customer chose full refund if no second booking joined",
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateErr) throw updateErr;

      await supabase.from("booking_billing_events").insert({
        booking_id: booking.id,
        event_type: "REFUND",
        description: "Mock full refund for unfilled Full Day Shared Charter",
        amount_cents: -refundAmount,
        currency: booking.currency ?? "USD",
        event_data: { choice, refund_status: "REFUNDED_MOCK" },
      });

      await supabase.from("booking_events").insert({
        booking_id: booking.id,
        event_type: "BOOKING_CANCELLED",
        event_data: { choice, date, refund_amount_cents: refundAmount },
      });

      continue;
    }

    if (choice === "HALF_DAY_AM" || choice === "HALF_DAY_PM") {
      const targetSlot: Slot = choice === "HALF_DAY_AM" ? "AM" : "PM";
      const targetCt = await getCharterType(targetSlot);
      if (!targetCt?.id) continue;

      const { start_at, end_at } = slotTimesUtc(date, targetSlot);

      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          charter_type_id: targetCt.id,
          start_at,
          end_at,
          status: "CONFIRMED",
          notes: [
            booking.notes,
            `Shared charter fallback applied: converted to ${targetSlot === "AM" ? "Half Day Morning" : "Half Day Afternoon"} Charter at no additional charge.`,
          ]
            .filter(Boolean)
            .join("\n"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateErr) throw updateErr;

      await supabase.from("booking_billing_events").insert({
        booking_id: booking.id,
        event_type: "ADJUSTMENT",
        description: `Shared charter converted to ${targetSlot === "AM" ? "Half Day Morning" : "Half Day Afternoon"} Charter at no additional charge`,
        amount_cents: 0,
        currency: booking.currency ?? "USD",
        event_data: { choice, original_total_amount_cents: booking.total_amount_cents },
      });

      await supabase.from("booking_events").insert({
        booking_id: booking.id,
        event_type: targetSlot === "AM" ? "BOOKING_CONVERTED_TO_AM" : "BOOKING_CONVERTED_TO_PM",
        event_data: { choice, date, before, after: { charter_type_id: targetCt.id, start_at, end_at } },
      });

      continue;
    }

    if (choice === "FULL_DAY_UPGRADE") {
      const fullDayCt = await getCharterType("FD");
      if (!fullDayCt?.id) continue;

      const { start_at, end_at } = slotTimesUtc(date, "FD");
      const fullDayAmount = Number(
        booking.contracted_full_day_amount_cents ?? fullDayCt.base_price_cents ?? booking.total_amount_cents
      );
      const upgradeBalance = Number(
        booking.contracted_upgrade_balance_cents ?? Math.max(0, fullDayAmount - Number(booking.total_amount_cents ?? 0))
      );

      const { error: updateErr } = await supabase
        .from("bookings")
        .update({
          charter_type_id: fullDayCt.id,
          start_at,
          end_at,
          status: "CONFIRMED",
          total_amount_cents: fullDayAmount,
          notes: [
            booking.notes,
            `Shared charter fallback applied: upgraded to Full Day Charter. Mock upgrade balance paid: ${upgradeBalance} cents.`,
          ]
            .filter(Boolean)
            .join("\n"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (updateErr) throw updateErr;

      await supabase.from("booking_billing_events").insert({
        booking_id: booking.id,
        event_type: "UPGRADE_PAYMENT",
        description: "Mock upgrade balance paid to convert Full Day Shared Charter to private Full Day Charter",
        amount_cents: upgradeBalance,
        currency: booking.currency ?? "USD",
        event_data: {
          choice,
          original_total_amount_cents: booking.total_amount_cents,
          full_day_amount_cents: fullDayAmount,
          payment_status: "PAID_MOCK",
        },
      });

      await supabase.from("booking_events").insert({
        booking_id: booking.id,
        event_type: "BOOKING_UPGRADED_TO_FULL_DAY",
        event_data: {
          choice,
          date,
          before,
          after: { charter_type_id: fullDayCt.id, start_at, end_at, total_amount_cents: fullDayAmount },
          upgrade_balance_cents: upgradeBalance,
        },
      });
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to parameters are required" }, { status: 400 });
  }

  try {
    await resolveSharedFallbacks();
  } catch (error) {
    console.error("shared fallback resolution error:", error);
    return NextResponse.json({ error: "Failed to resolve shared charter fallbacks" }, { status: 500 });
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
