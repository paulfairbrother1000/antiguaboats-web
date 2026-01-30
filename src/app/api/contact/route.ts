// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  countryIso2: string;
  countryDial: string;
  mobileLocal: string;
  mobileE164: string;
  reason: string;
  message: string;
  pagePath?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function cleanText(s: unknown, max = 1000) {
  const v = String(s ?? "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return NextResponse.json(
        { ok: false, error: "Server is missing Supabase env vars." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Partial<ContactPayload>;

    const firstName = cleanText(body.firstName, 80);
    const lastName = cleanText(body.lastName, 80);
    const email = cleanText(body.email, 120);
    const countryIso2 = cleanText(body.countryIso2, 10);
    const countryDial = cleanText(body.countryDial, 10);
    const mobileLocal = cleanText(body.mobileLocal, 40);
    const mobileE164 = cleanText(body.mobileE164, 20);
    const reason = cleanText(body.reason, 80);
    const message = cleanText(body.message, 2000);
    const pagePath = cleanText(body.pagePath ?? "", 200);

    if (!firstName || !lastName) {
      return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
    }
    if (!countryIso2 || !countryDial) {
      return NextResponse.json({ ok: false, error: "Country is required." }, { status: 400 });
    }
    if (!mobileLocal || !mobileE164) {
      return NextResponse.json({ ok: false, error: "Mobile is required." }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ ok: false, error: "Reason is required." }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || null;

    // Best-effort IP (behind Vercel this is usually present)
    const xff = req.headers.get("x-forwarded-for");
    const ip = xff ? xff.split(",")[0].trim() : null;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from("contact_requests").insert({
      first_name: firstName,
      last_name: lastName,
      email,

      country_iso2: countryIso2,
      country_dial: countryDial,
      mobile_local: mobileLocal,
      mobile_e164: mobileE164,

      reason,
      message,

      source: "antiguaboats-web",
      page_path: pagePath || null,
      user_agent: userAgent,
      ip,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
