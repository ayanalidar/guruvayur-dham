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
  return NextResponse.json(
    { rooms: rooms.map(serializeRoom) },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
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

// POST /api/rooms · create a new room
// body: { slug, name, type, price, capacity, size, bedType, image, description, shortDesc, ... }
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.slug || !body.name || !body.type || body.price === undefined) {
    return NextResponse.json(
      { error: "slug, name, type, and price are required" },
      { status: 400 }
    );
  }

  // Check for duplicate slug
  const existing = await db.room.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json(
      { error: `Room with slug "${body.slug}" already exists` },
      { status: 409 }
    );
  }

  const room = await db.room.create({
    data: {
      slug: body.slug,
      name: body.name,
      type: body.type,
      price: parseInt(body.price) || 0,
      originalPrice: body.originalPrice ? parseInt(body.originalPrice) : null,
      rating: body.rating ? parseFloat(body.rating) : 4.7,
      reviews: body.reviews ? parseInt(body.reviews) : 0,
      capacity: parseInt(body.capacity) || 2,
      size: body.size || "200 sq.ft",
      bedType: body.bedType || "1 Double Bed",
      image: body.image || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      gallery: JSON.stringify(body.gallery || [body.image || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop"]),
      badge: body.badge || null,
      description: body.description || "",
      shortDesc: body.shortDesc || "",
      amenities: JSON.stringify(body.amenities || ["Wifi", "TV", "Geyser", "HotWater", "AttachedBath"]),
      totalUnits: parseInt(body.totalUnits) || 1,
      active: body.active !== false,
    },
  });

  // Create DIRECT rate plan for the new room
  await db.ratePlan.create({
    data: {
      roomId: room.id,
      channelPartner: "DIRECT",
      priceModifier: 1.0,
    },
  });

  // Initialize availability for next 90 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    await db.availability.create({
      data: {
        roomId: room.id,
        date,
        available: room.totalUnits,
      },
    });
  }

  return NextResponse.json({ room: serializeRoom(room), message: "Room created" });
}

function serializeRoom(r: any) {
  return {
    ...r,
    gallery: JSON.parse(r.gallery || "[]"),
    amenities: JSON.parse(r.amenities || "[]"),
    rates: r.rates || [],
  };
}
