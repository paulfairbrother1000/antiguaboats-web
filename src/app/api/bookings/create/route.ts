import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Slot = "FD" | "SHARED_FD" | "AM" | "PM" | "SS";
type SharedFallbackChoice = "CANCEL_REFUND" | "HALF_DAY_AM" | "HALF_DAY_PM" | "FULL_DAY_UPGRADE";

const CHARTER_TYPE_ID_BY_SLOT: Record<Slot, string> = {
  FD: "0c8cbd74-3eb6-49eb-84cf-53edb8924860",
  SHARED_FD: "PUT-YOUR-FULL-DAY-SHARED-CHARTER-TYPE-ID-HERE",
  AM: "c6baf78b-0b88-40fb-aaf9-0e1295124e94",
  PM: "e7e10d1e-cc2d-48f5-a028-3e80103b9fb5",
  SS: "c0619b2a-8dbd-4df4-916b-afb880ecc279",
};

function isSlot(v: any): v is Slot {
  return v === "FD" || v === "SHARED_FD" || v === "AM" || v === "PM" || v === "SS";
}

function isSharedFallbackChoice(v: any): v is SharedFallbackChoice {
  return (
    v === "CANCEL_REFUND" ||
    v === "HALF_DAY_AM" ||
    v === "HALF_DAY_PM" ||
    v === "FULL_DAY_UPGRADE"
  );
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      date,
      guests,
      total_amount_cents,
      currency = "USD",
      customer_name,
      customer_email,
      customer_phone,
      notes,
      shared_fallback_choice,
    } = body ?? {};

    const slot = body?.slot_mode ?? body?.slot;
    if (slot === "SEAT_FD") {
      const { createSeatBooking } = await import("@/lib/createSeatBooking");
      return createSeatBooking(body);
    }

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    if (!isSlot(slot)) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }

    if (slot === "SHARED_FD" && Number(guests) > 4) {
      return NextResponse.json(
        { error: "Full Day Shared Charter allows up to 4 guests per booking" },
        { status: 400 }
      );
    }

    if (slot === "SHARED_FD" && shared_fallback_choice && !isSharedFallbackChoice(shared_fallback_choice)) {
      return NextResponse.json({ error: "Invalid shared_fallback_choice" }, { status: 400 });
    }

    if (!total_amount_cents || typeof total_amount_cents !== "number") {
      return NextResponse.json({ error: "Missing total_amount_cents" }, { status: 400 });
    }

    if (!customer_name || typeof customer_name !== "string") {
      return NextResponse.json({ error: "Missing customer_name" }, { status: 400 });
    }

    if (!customer_email || typeof customer_email !== "string") {
      return NextResponse.json({ error: "Missing customer_email" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env vars" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let charter_type_id = CHARTER_TYPE_ID_BY_SLOT[slot];
    let sharedFullDayAmountCents: number | null = null;
    let privateFullDayAmountCents: number | null = null;

    if (slot === "SHARED_FD") {
      const { data: sharedCt, error: sharedCtErr } = await supabase
        .from("charter_types")
        .select("id,base_price_cents")
        .eq("slot_mode", "SHARED_FD")
        .eq("active", true)
        .maybeSingle();

      if (sharedCtErr) {
        return NextResponse.json({ error: sharedCtErr.message }, { status: 500 });
      }

      if (!sharedCt?.id) {
        return NextResponse.json(
          { error: "Full Day Shared Charter type not found or inactive" },
          { status: 404 }
        );
      }

      const { data: fullDayCt, error: fullDayCtErr } = await supabase
        .from("charter_types")
        .select("base_price_cents")
        .eq("slot_mode", "FD")
        .eq("active", true)
        .maybeSingle();

      if (fullDayCtErr) {
        return NextResponse.json({ error: fullDayCtErr.message }, { status: 500 });
      }

      charter_type_id = sharedCt.id;
      sharedFullDayAmountCents = Number(sharedCt.base_price_cents ?? total_amount_cents);
      privateFullDayAmountCents = Number(fullDayCt?.base_price_cents ?? 0) || null;
    }

    const { start_at, end_at } = slotTimesUtc(date, slot);
    const contractedUpgradeBalanceCents =
      slot === "SHARED_FD" && privateFullDayAmountCents !== null && sharedFullDayAmountCents !== null
        ? Math.max(0, privateFullDayAmountCents - sharedFullDayAmountCents)
        : null;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        charter_type_id,
        start_at,
        end_at,
        status: "CONFIRMED",
        hold_expires_at: null,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        customer_phone: (customer_phone ?? "").trim() || null,
        total_amount_cents,
        currency,
        notes: (notes ?? "").trim() || null,
        shared_fallback_choice: slot === "SHARED_FD" ? shared_fallback_choice || null : null,
        contracted_shared_amount_cents: slot === "SHARED_FD" ? sharedFullDayAmountCents : null,
        contracted_full_day_amount_cents: slot === "SHARED_FD" ? privateFullDayAmountCents : null,
        contracted_upgrade_balance_cents: slot === "SHARED_FD" ? contractedUpgradeBalanceCents : null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("booking_events").insert({
      booking_id: data.id,
      event_type: "BOOKING_CREATED",
      event_data: {
        slot,
        date,
        guests,
        total_amount_cents,
        currency,
        shared_fallback_choice: slot === "SHARED_FD" ? shared_fallback_choice || null : null,
      },
    });

    await supabase.from("booking_billing_events").insert({
      booking_id: data.id,
      event_type: "ORIGINAL_PAYMENT",
      description: slot === "SHARED_FD" ? "Mock payment received for Full Day Shared Charter" : "Mock payment received",
      amount_cents: total_amount_cents,
      currency,
      event_data: {
        slot,
        date,
        payment_status: "PAID_MOCK",
      },
    });

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
