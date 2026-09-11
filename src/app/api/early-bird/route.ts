import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateEarlyBirdSchema = z.object({
  name: z.string().min(1).max(200),
  festivalName: z.string().min(1).max(200),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  bookingWindowStart: z.string().min(1),
  bookingWindowEnd: z.string().min(1),
});

// GET /api/early-bird · list active campaigns
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const campaigns = await db.earlyBirdCampaign.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ campaigns });
}

// POST /api/early-bird · create campaign
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER", "ACCOUNTANT"]);
  if (error) return error;

  const parsed = CreateEarlyBirdSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;
  const campaign = await db.earlyBirdCampaign.create({
    data: {
      name: body.name,
      festivalName: body.festivalName,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      discountPercent: body.discountPercent ?? 15,
      bookingWindowStart: new Date(body.bookingWindowStart),
      bookingWindowEnd: new Date(body.bookingWindowEnd),
    },
  });
  return NextResponse.json({ campaign });
}
