import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The scheduled worker authenticates separately with CRON_SECRET.
  if (process.env.DEV_SITE_PASSWORD && pathname !== "/api/cron/charters") {
    const auth = req.headers.get("authorization") ?? "";
    let credentials = "";
    try {
      if (auth.startsWith("Basic ")) credentials = atob(auth.slice(6));
    } catch { /* Invalid credentials receive the same login prompt. */ }
    if (credentials !== `${process.env.DEV_SITE_USERNAME ?? "dev"}:${process.env.DEV_SITE_PASSWORD}`) {
      return new NextResponse("Please sign in to view the development site.", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Antigua Boats development", charset="UTF-8"',
          "Cache-Control": "no-store",
        },
      });
    }
  }

  if (pathname.startsWith("/admin")) {
    // allow login page through
    if (pathname.startsWith("/admin/login")) return NextResponse.next();

    const token = req.cookies.get("ab_admin")?.value;
    if (token !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
