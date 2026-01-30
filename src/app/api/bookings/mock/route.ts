import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  charter_type_id: string;
  start_at: string;
  end_at: string;
  status?: "CONFIRMED" | "HOLD";
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  total_amount_cents: number;
  currency?: string;
  notes?: string | null;
  meta?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    if (!body?.charter_type_id || !body?.start_at || !body?.end_at) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!body?.customer_name?.trim() || !body?.customer_email?.trim()) {
      return NextResponse.json({ error: "Customer name/email required." }, { status: 400 });
    }

    if (!Number.isFinite(body.total_amount_cents) || body.total_amount_cents <= 0) {
      return NextResponse.json({ error: "Invalid total_amount_cents." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const notesWithMeta =
      body.meta && Object.keys(body.meta).length > 0
        ? [
            body.notes?.trim() ? body.notes.trim() : null,
            "",
            "--- meta ---",
            JSON.stringify(body.meta),
          ]
            .filter(Boolean)
            .join("\n")
        : body.notes?.trim() || null;

    const insertRow = {
      charter_type_id: body.charter_type_id,
      start_at: body.start_at,
      end_at: body.end_at,
      status: body.status ?? "CONFIRMED",
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email.trim(),
      customer_phone: body.customer_phone?.trim() || null,
      total_amount_cents: Math.round(body.total_amount_cents),
      currency: body.currency ?? "USD",
      notes: notesWithMeta,
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert(insertRow)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, booking: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
