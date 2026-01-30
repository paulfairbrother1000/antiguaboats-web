import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Slot = "FD" | "AM" | "PM" | "SS";

const CHARTER_TYPE_ID_BY_SLOT: Record<Slot, string> = {
  FD: "0c8cbd74-3eb6-49eb-84cf-53edb8924860",
  AM: "c6baf78b-0b88-40fb-aaf9-0e1295124e94",
  PM: "e7e10d1e-cc2d-48f5-a028-3e80103b9fb5",
  SS: "c0619b2a-8dbd-4df4-916b-afb880ecc279",
};

function slotTimesUtc(dateISO: string, slot: Slot) {
  // dateISO: "YYYY-MM-DD"
  const [yStr, mStr, dStr] = dateISO.split("-");
  const y = Number(yStr);
  const m = Number(mStr) - 1;
  const d = Number(dStr);

  if (slot === "FD") {
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
  // SS
  return {
    start_at: new Date(Date.UTC(y, m, d, 16, 30, 0)).toISOString(),
    end_at: new Date(Date.UTC(y, m, d, 18, 30, 0)).toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      date, // YYYY-MM-DD
      slot, // FD|AM|PM|SS
      guests, // number
      total_amount_cents, // number
      currency = "USD",
      customer_name,
      customer_email,
      customer_phone,
      notes,
    } = body ?? {};

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }
    if (!slot || !["FD", "AM", "PM", "SS"].includes(slot)) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
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

    const charter_type_id = CHARTER_TYPE_ID_BY_SLOT[slot as Slot];
    const { start_at, end_at } = slotTimesUtc(date, slot as Slot);

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
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
