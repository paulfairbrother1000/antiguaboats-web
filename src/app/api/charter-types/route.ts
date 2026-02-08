import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase env vars not set" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("charter_types")
    .select("slug,slot_mode,title,base_price_cents,currency,active")
    .eq("active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build two maps:
  // 1) by slot_mode (FD/AM/PM/SS) if your DB uses it
  // 2) by slug (day/half-day/sunset) which your charter pages already use
  const by_slot_mode: Record<string, { title: string; base_price_cents: number; currency: string; slug?: string }> =
    {};
  const by_slug: Record<string, { title: string; base_price_cents: number; currency: string; slot_mode?: string }> = {};

  for (const row of data ?? []) {
    const slug = String((row as any).slug ?? "");
    const slot_mode = (row as any).slot_mode ? String((row as any).slot_mode) : "";
    const title = String((row as any).title ?? "");
    const base_price_cents = Number((row as any).base_price_cents ?? 0);
    const currency = String((row as any).currency ?? "USD");

    if (slug) {
      by_slug[slug] = { title, base_price_cents, currency, slot_mode: slot_mode || undefined };
    }
    if (slot_mode) {
      by_slot_mode[slot_mode] = { title, base_price_cents, currency, slug: slug || undefined };
    }
  }

  return NextResponse.json({ by_slot_mode, by_slug });
}
