import { NextRequest, NextResponse } from "next/server";
import { getCrowdForecast } from "@/lib/pricing";

// GET /api/crowd-forecast?date=2026-09-10
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
  const forecast = await getCrowdForecast(date);
  return NextResponse.json({ date: date.toISOString().slice(0, 10), ...forecast });
}
