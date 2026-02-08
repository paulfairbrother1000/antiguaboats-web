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
    .select("slot_mode,title,base_price_cents,currency,active")
    .eq("active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return a simple map keyed by slot_mode: FD/AM/PM/SS
  const map: Record<string, { title: string; base_price_cents: number; currency: string }> = {};
  for (const row of data ?? []) {
    const slot = (row as any).slot_mode;
    if (!slot) continue;
    map[String(slot)] = {
      title: String((row as any).title ?? ""),
      base_price_cents: Number((row as any).base_price_cents ?? 0),
      currency: String((row as any).currency ?? "USD"),
    };
  }

  return NextResponse.json(map);
}
