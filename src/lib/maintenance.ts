import { NextRequest, NextResponse } from "next/server";
import { getFeatureFlag } from "@/lib/settings";

/**
 * Maintenance mode middleware.
 *
 * If the MAINTENANCE_MODE feature flag is enabled:
 * - Guest-facing pages redirect to /#/maintenance
 * - Guest-facing API routes return 503
 * - Admin routes (/admin/*, /api/admin/*) + login still work
 * - Health check + settings routes still work (so admin can toggle it off)
 */

const ADMIN_ROUTES = [
  "/api/auth/",
  "/api/admin",
  "/api/settings",
  "/api/feature-flags",
  "/api/health-check",
  "/api/maintenance",
  "/api/admin-notifications",
  "/api/backup",
];

export async function maintenanceCheck(req: NextRequest): Promise<NextResponse | null> {
  const path = req.nextUrl.pathname;

  // Skip maintenance check for admin/auth/settings routes
  if (ADMIN_ROUTES.some((r) => path.startsWith(r))) {
    return null;
  }

  // Check if maintenance mode is on
  const isMaintenance = await getFeatureFlag("MAINTENANCE_MODE");
  if (!isMaintenance) return null;

  // For API routes: return 503
  if (path.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Service temporarily unavailable. We'll be back shortly." },
      { status: 503, headers: { "Retry-After": "300" } }
    );
  }

  // For page navigations: redirect to maintenance page
  // (but don't redirect if already on maintenance page or login)
  if (path === "/" || path.startsWith("/#/")) {
    const hash = req.nextUrl.hash;
    if (hash.includes("maintenance") || hash.includes("login") || hash.includes("admin")) {
      return null;
    }
    // Redirect to maintenance page
    const res = NextResponse.redirect(new URL("/#/maintenance", req.url));
    return res;
  }

  return null;
}
