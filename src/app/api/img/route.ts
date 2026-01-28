import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowed(url: URL) {
  const h = url.hostname.toLowerCase();
  return h.endsWith(".supabase.co");
}

function svgPlaceholder(label: string, cacheSeconds = 30) {
  const safe = (label || "Image unavailable").replace(/[<>&]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#64748b" font-size="20" font-family="Arial, sans-serif">
        ${safe}
      </text>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    },
  });
}

async function fetchWithTimeout(url: string, headers: Record<string, string>, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers,
      cache: "force-cache",
    });
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw) return svgPlaceholder("Missing image URL");

  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return svgPlaceholder("Invalid image URL");
  }

  if (u.protocol !== "https:") {
    u = new URL(u.toString().replace(/^http:/i, "https:"));
  }

  if (!isAllowed(u)) {
    return svgPlaceholder("Host not allowed", 300);
  }

  const anon = process.env.PACE_SUPABASE_ANON_KEY;

  const headers: Record<string, string> = {
    accept: "image/*",
    "user-agent": "AntiguaBoats/1.0 (+https://www.antigua-boats.com)",
    referer: "https://www.antigua-boats.com/",
  };

  // optional: can help with some Supabase setups
  if (anon) {
    headers.apikey = anon;
    headers.authorization = `Bearer ${anon}`;
  }

  const target = u.toString();

  try {
    // Attempt 1
    let upstream = await fetchWithTimeout(target, headers, 8000);

    // Retry once if it failed (handles transient "fetch failed"/TLS flaps)
    if (!upstream.ok) {
      upstream = await fetchWithTimeout(target, headers, 8000);
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      const res = svgPlaceholder("Image unavailable", 30);
      res.headers.set("x-upstream-status", String(upstream.status));
      res.headers.set("x-upstream-content-type", contentType || "unknown");
      return res;
    }

    if (!contentType.toLowerCase().startsWith("image/")) {
      const res = svgPlaceholder("Image unavailable", 30);
      res.headers.set("x-upstream-status", String(upstream.status));
      res.headers.set("x-upstream-content-type", contentType || "unknown");
      return res;
    }

    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      headers: {
        "content-type": contentType || "image/jpeg",
        // cache successful images longer
        "cache-control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    const label = err?.name === "AbortError" ? "Image timed out" : "Image unavailable";
    const res = svgPlaceholder(label, 10);
    res.headers.set("x-proxy-error", err?.message ?? "fetch failed");
    return res;
  }
}
