import { NextResponse } from "next/server";
import { fetchPaceShuttleRoutes } from "@/lib/paceShuttles";

export async function GET() {
  const routes = await fetchPaceShuttleRoutes();
  return NextResponse.json({ routes });
}
