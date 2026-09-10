import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight health check endpoint for Docker HEALTHCHECK,
 * load balancers, and uptime monitors.
 *
 * Returns 200 if the app is running. Does NOT check the database
 * (to avoid false-negatives if DB is briefly slow).
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
}
