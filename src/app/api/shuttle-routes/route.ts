import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Antigua Boats → Pace Shuttles proxy
 *
 * - Server-side only
 * - Hides operator key
 * - Avoids CSP / CORS issues
 * - Normalises Pace image URLs to the working Supabase host
 */

function must(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

/**
 * Pace images are currently referenced from two Supabase project hosts.
 * We have confirmed by direct test that ONLY this host serves the images:
 */
const WORKING_SUPABASE_HOST = "bopvaaexicvdueidyvjd.supabase.co";

function normaliseSupabaseUrl(raw?: string): string | undefined {
  if (!raw) return undefined;

  try {
    const u = new URL(raw);

    // Only rewrite Supabase URLs
    if (u.hostname.toLowerCase().endsWith(".supabase.co")) {
      u.hostname = WORKING_SUPABASE_HOST;
      u.protocol = "https:";
    }

    return u.toString();
  } catch {
    // If it's not a valid URL, return as-is
    return raw;
  }
}

function normaliseTileImages(tile: any) {
  if (tile?.pickup?.image_url) {
    tile.pickup.image_url = normaliseSupabaseUrl(tile.pickup.image_url);
  }
  if (tile?.destination?.image_url) {
    tile.destination.image_url = normaliseSupabaseUrl(tile.destination.image_url);
  }
  return tile;
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
        accept: "application/json",
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

    // Normalise images so all tiles reference the working Supabase host
    if (Array.isArray(data?.tiles)) {
      data.tiles = data.tiles.map(normaliseTileImages);
    }

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
