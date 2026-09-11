import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const UpdateChannelPartnerSchema = z.object({
  code: z.string().min(1).max(50),
  connected: z.boolean(),
});

// GET /api/channel-partners · list all channel partners with stats
export async function GET() {
  const partners = await db.channelPartner.findMany({
    orderBy: { name: "asc" },
  });

  // Add booking counts from each channel
  const stats = await db.booking.groupBy({
    by: ["source"],
    _count: true,
    _sum: { amount: true },
  });
  const statsMap: Record<string, any> = {};
  for (const s of stats) statsMap[s.source] = s;

  // Add recent sync logs count
  const syncStats = await db.syncLog.groupBy({
    by: ["channel"],
    _count: true,
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });
  const syncMap: Record<string, number> = {};
  for (const s of syncStats) syncMap[s.channel] = s._count;

  return NextResponse.json({
    partners: partners.map((p) => ({
      ...p,
      bookingCount: statsMap[p.code]?._count || 0,
      totalRevenue: statsMap[p.code]?._sum.amount || 0,
      syncsLast7Days: syncMap[p.code] || 0,
    })),
  });
}

// PATCH /api/channel-partners · connect/disconnect a channel
// body: { code, connected: boolean }
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateChannelPartnerSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { code, connected } = parsed.data;
  const partner = await db.channelPartner.update({
    where: { code },
    data: { connected },
  });
  return NextResponse.json({ partner });
}
