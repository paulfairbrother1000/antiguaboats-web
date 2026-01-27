import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = body.password as string;

  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("ab_admin", "1", { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  return res;
}
