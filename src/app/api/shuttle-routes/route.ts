import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Antigua Boats → Pace Shuttles proxy
 *
 * - Server-side only
 * - Hides operator key
 * - Avoids CSP / CORS issues
 * - Reusable by any operator site
 */

function must(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export async function GET() {
  try {
    const BASE_URL = must("PACE_PARTNER_BASE_URL");
    const OPERATOR_ID = must("PACE_OPERATOR_ID");
    const OPERATOR_KEY = must("PACE_OPERATOR_KEY");

    const url = `${BASE_URL}/api/public/partner/shuttle-routes?operator_id=${OPERATOR_ID}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-operator-key": OPERATOR_KEY,
        "accept": "application/json",
      },
      // absolutely no caching for price-sensitive data
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Upstream Pace Shuttles error",
          status: res.status,
          body: text,
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      source: "pace-shuttles",
      fetched_at: new Date().toISOString(),
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
