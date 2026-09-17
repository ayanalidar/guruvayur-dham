import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { withRetry } from "@/lib/retry";
import {
  runAllHealthChecks,
  type HealthCheckResult,
} from "@/lib/health-check";

/**
 * POST /api/settings/test
 *
 * Test a single integration by re-running its health-check probe.
 * Uses withRetry so transient failures (network blips) don't show as red.
 *
 * body: { service: "razorpay" | "groq" | "whatsapp" | "smtp" | "upstash" | "blob" }
 *
 * Returns: { service, status, latency?, message }
 *
 * MANAGER-only — the test probes hit external APIs with stored credentials,
 * so we don't want non-managers triggering it.
 */

const TestServiceSchema = z.object({
  service: z.enum(["razorpay", "groq", "whatsapp", "smtp", "upstash", "blob"]),
});

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = TestServiceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { service } = parsed.data;

  // runAllHealthChecks calls all probes in parallel. To test just one,
  // we run the whole batch (cheap — ~2s) and pick the matching service.
  // withRetry wraps the call so a one-off probe failure is retried.
  let checks: HealthCheckResult[];
  try {
    const result = await withRetry(
      () => runAllHealthChecks(),
      {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 2000,
        timeoutMs: 15000,
        circuitBreakerKey: `health-check:${service}`,
      },
    );
    checks = result.checks;
  } catch (e: any) {
    return NextResponse.json(
      {
        service,
        status: "error",
        message: e?.message || "Health check failed after retries",
      },
      { status: 502 },
    );
  }

  const match = checks.find((c) => c.service === service);
  if (!match) {
    return NextResponse.json(
      { service, status: "error", message: `Unknown service: ${service}` },
      { status: 400 },
    );
  }

  return NextResponse.json(match);
}
