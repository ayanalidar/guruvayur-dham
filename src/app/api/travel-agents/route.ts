import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateTravelAgentSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional(),
  commissionRate: z.coerce.number().min(0).max(1).optional(),
  creditLimit: z.coerce.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).passthrough();

const UpdateTravelAgentSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

const RecordAgentBookingSchema = z.object({
  agentId: z.string().min(1),
  bookingAmount: z.coerce.number().min(0),
});

// GET /api/travel-agents · list all B2B agents
export async function GET() {
  const agents = await db.travelAgent.findMany({ orderBy: { companyName: "asc" } });
  return NextResponse.json({ agents });
}

// POST /api/travel-agents · create new agent
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateTravelAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const agent = await db.travelAgent.create({ data: parsed.data as any });
  return NextResponse.json({ agent });
}

// PATCH /api/travel-agents · update agent
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateTravelAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const agent = await db.travelAgent.update({ where: { id }, data: data as any });
  return NextResponse.json({ agent });
}

// PUT /api/travel-agents · record a booking for an agent (commission tracking)
export async function PUT(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER", "ACCOUNTANT"]);
  if (error) return error;

  const parsed = RecordAgentBookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { agentId, bookingAmount } = parsed.data;
  const commission = Math.round(bookingAmount * 0.12); // default 12%
  const agent = await db.travelAgent.update({
    where: { id: agentId },
    data: {
      totalBookings: { increment: 1 },
      outstanding: { increment: commission },
    },
  });
  return NextResponse.json({ agent, commission });
}
