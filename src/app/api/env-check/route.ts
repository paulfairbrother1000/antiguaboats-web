import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime, not Edge

export async function GET() {
  return NextResponse.json({
    hasPaceUrl: Boolean(process.env.PACE_PARTNER_BASE_URL),
    hasPaceToken: Boolean(process.env.PACE_API_TOKEN),
    nodeEnv: process.env.NODE_ENV,
  });
}
