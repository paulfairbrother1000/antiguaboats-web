import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prevent open-proxy abuse: only allow known image hosts
function isAllowed(url: URL) {
  const h = url.hostname.toLowerCase();
  return h.endsWith(".supabase.co");
}

function snippet(s: string, n = 600) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("url");
    if (!raw) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    let url: URL;
    try {
      url = new URL(raw.trim());
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    // Force https if someone passed http
    if (url.protocol !== "https:") {
      url = new URL(url.toString().replace(/^http:/i, "https:"));
    }

    if (!isAllowed(url)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    // Timeout (prevents long-hanging requests becoming 500s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let upstream: Response;
    try {
      upstream = await fetch(url.toString(), {
        signal: controller.signal,
        redirect: "follow",
        headers: {
          accept: "image/*",
          "user-agent": "AntiguaBoats/1.0 (+https://www.antigua-boats.com)",
          referer: "https://www.antigua-boats.com/",
        },
        cache: "force-cache",
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = upstream.headers.get("content-type") || "";

    // If upstream returns non-OK, provide useful diagnostics
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Upstream image fetch failed",
          upstream_status: upstream.status,
          upstream_content_type: contentType,
          upstream_body: snippet(text),
          url: url.toString(),
        },
        { status: 502 }
      );
    }

    // Sometimes CDNs return 200 with an HTML/JSON body; treat as failure
    if (!contentType.toLowerCase().startsWith("image/")) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Upstream returned non-image content",
          upstream_status: upstream.status,
          upstream_content_type: contentType,
          upstream_body: snippet(text),
          url: url.toString(),
        },
        { status: 502 }
      );
    }

    const bytes = await upstream.arrayBuffer();

    return new NextResponse(bytes, {
      headers: {
        "content-type": contentType || "image/jpeg",
        "cache-control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    // IMPORTANT: never throw — always respond
    const msg =
      err?.name === "AbortError"
        ? "Upstream image fetch timed out"
        : err?.message ?? "Failed to fetch image";

    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
