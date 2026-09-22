import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

/**
 * GET /api/webhook-deliveries
 *
 * Returns recent webhook delivery logs (inbound WhatsApp + channel webhooks).
 * Useful for debugging "did our booking webhook fire?" questions.
 *
 * Query:
 *   ?source=WHATSAPP   — filter by source (WHATSAPP | BOOKING_COM | MAKEMYTRIP | GOIBIBO | AGODA)
 *   ?limit=20          — cap (default 50, max 200)
 *
 * MANAGER-only — payload bodies may contain PII (guest phone numbers etc.).
 */

const SourceEnum = z.enum([
  "WHATSAPP",
  "BOOKING_COM",
  "MAKEMYTRIP",
  "GOIBIBO",
  "AGODA",
]);

const QuerySchema = z.object({
  source: SourceEnum.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = QuerySchema.safeParse({
    source: req.nextUrl.searchParams.get("source") || undefined,
    limit: req.nextUrl.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { source, limit } = parsed.data;

  const where: any = {};
  if (source) where.source = source;

  const deliveries = await db.webhookDelivery.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ deliveries });
}
