import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/rooms · fetch all rooms (with live availability count for next 30 days)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const room = await db.room.findUnique({ where: { slug }, include: { rates: true } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    return NextResponse.json({ room: serializeRoom(room) });
  }
  const rooms = await db.room.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
    include: { rates: true },
  });
  return NextResponse.json({ rooms: rooms.map(serializeRoom) });
}

// PATCH /api/rooms · update a room (price, name, description, etc.)
// body: { id, data: { ...fields }
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const room = await db.room.update({ where: { id }, data });
  return NextResponse.json({ room: serializeRoom(room) });
}

function serializeRoom(r: any) {
  return {
    ...r,
    gallery: JSON.parse(r.gallery || "[]"),
    amenities: JSON.parse(r.amenities || "[]"),
    rates: r.rates || [],
  };
}
