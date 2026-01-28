import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prevent open-proxy abuse: only allow known image hosts
function isAllowed(url: URL) {
  const h = url.hostname.toLowerCase();
  return h.endsWith(".supabase.co");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  if (!raw) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!isAllowed(url)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(url.toString(), { cache: "force-cache" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream image fetch failed" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
