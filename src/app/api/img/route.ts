import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prevent open-proxy abuse: only allow known image hosts
function isAllowed(url: URL) {
  const h = url.hostname.toLowerCase();
  return h.endsWith(".supabase.co");
}

function svgPlaceholder(label: string) {
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
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw) return svgPlaceholder("Missing image URL");

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return svgPlaceholder("Invalid image URL");
  }

  // Force https
  if (url.protocol !== "https:") {
    url = new URL(url.toString().replace(/^http:/i, "https:"));
  }

  if (!isAllowed(url)) {
    return svgPlaceholder("Host not allowed");
  }

  // Timeout (avoid long-hanging requests)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        accept: "image/*",
        "user-agent": "AntiguaBoats/1.0 (+https://www.antigua-boats.com)",
        referer: "https://www.antigua-boats.com/",
      },
      cache: "force-cache",
    });

    const contentType = upstream.headers.get("content-type") || "";

    // If upstream isn't OK, return a placeholder image (not JSON)
    if (!upstream.ok) {
      const res = svgPlaceholder("Image unavailable");
      res.headers.set("x-upstream-status", String(upstream.status));
      res.headers.set("x-upstream-content-type", contentType || "unknown");
      return res;
    }

    // If upstream returns non-image content, return placeholder
    if (!contentType.toLowerCase().startsWith("image/")) {
      const res = svgPlaceholder("Image unavailable");
      res.headers.set("x-upstream-status", String(upstream.status));
      res.headers.set("x-upstream-content-type", contentType || "unknown");
      return res;
    }

    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      headers: {
        "content-type": contentType || "image/jpeg",
        "cache-control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    const label = err?.name === "AbortError" ? "Image timed out" : "Image unavailable";
    const res = svgPlaceholder(label);
    res.headers.set("x-proxy-error", err?.message ?? "unknown");
    return res;
  } finally {
    clearTimeout(timeout);
  }
}
