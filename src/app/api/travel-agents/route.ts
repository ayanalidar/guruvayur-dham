import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/travel-agents · list all B2B agents
export async function GET() {
  const agents = await db.travelAgent.findMany({ orderBy: { companyName: "asc" } });
  return NextResponse.json({ agents });
}

// POST /api/travel-agents · create new agent
export async function POST(req: NextRequest) {
  const body = await req.json();
  const agent = await db.travelAgent.create({ data: body });
  return NextResponse.json({ agent });
}

// PATCH /api/travel-agents · update agent
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  const agent = await db.travelAgent.update({ where: { id }, data });
  return NextResponse.json({ agent });
}

// PUT /api/travel-agents · record a booking for an agent (commission tracking)
export async function PUT(req: NextRequest) {
  const { agentId, bookingAmount } = await req.json();
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
