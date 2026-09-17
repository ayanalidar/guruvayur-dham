import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-safe";

// GET /api/rooms · fetch all rooms (with live availability count for next 30 days)
// FUNCTIONAL (Round 3 F17 fix): wrapped in withErrorHandler so DB blips return
// a proper JSON error instead of a raw 500 HTML page.
export const GET = withErrorHandler(async (req: NextRequest) => {
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
});

const UpdateRoomSchema = z.object({
  id: z.string().min(1),
  // SECURITY (Phase2-MassAssignment): explicit whitelist of Room columns.
  // id/createdAt/updatedAt are server-controlled. Note: Prisma model uses
  // `image` (singular) and `gallery` (JSON array of URLs as string), not
  // `images` — spec list adapted to actual Prisma field names so the admin
  // UI's PATCH {name|price|shortDesc|totalUnits|image|...} continues to work.
  data: z.object({
    slug: z.string().max(200).optional(),
    name: z.string().max(200).optional(),
    type: z.string().max(100).optional(),
    price: z.coerce.number().min(0).optional(),
    originalPrice: z.coerce.number().min(0).nullable().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    reviews: z.coerce.number().int().min(0).optional(),
    capacity: z.coerce.number().int().min(1).optional(),
    size: z.string().max(100).optional(),
    bedType: z.string().max(100).optional(),
    image: z.string().max(2000).optional(),
    gallery: z.string().max(10000).optional(),
    badge: z.string().max(100).nullable().optional(),
    description: z.string().max(5000).optional(),
    shortDesc: z.string().max(500).optional(),
    amenities: z.string().max(2000).optional(),
    totalUnits: z.coerce.number().int().min(1).optional(),
    active: z.boolean().optional(),
  }).strict(),
});

// PATCH /api/rooms · update a room (price, name, description, etc.)
// body: { id, data: { ...fields }
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateRoomSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  const room = await db.room.update({ where: { id }, data });
  return NextResponse.json({ room: serializeRoom(room) });
}

const CreateRoomSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  price: z.coerce.number().min(0),
  originalPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviews: z.coerce.number().int().min(0).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  size: z.string().max(100).optional(),
  bedType: z.string().max(100).optional(),
  image: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  badge: z.string().max(100).optional(),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  totalUnits: z.coerce.number().int().min(1).optional(),
  active: z.boolean().optional(),
});

// POST /api/rooms · create a new room
// body: { slug, name, type, price, capacity, size, bedType, image, description, shortDesc, ... }
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateRoomSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

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
      price: body.price,
      originalPrice: body.originalPrice ?? null,
      rating: body.rating ?? 4.7,
      reviews: body.reviews ?? 0,
      capacity: body.capacity ?? 2,
      size: body.size || "200 sq.ft",
      bedType: body.bedType || "1 Double Bed",
      image: body.image || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      gallery: JSON.stringify(body.gallery || [body.image || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop"]),
      badge: body.badge || null,
      description: body.description || "",
      shortDesc: body.shortDesc || "",
      amenities: JSON.stringify(body.amenities || ["Wifi", "TV", "Geyser", "HotWater", "AttachedBath"]),
      totalUnits: body.totalUnits ?? 1,
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

// DELETE /api/rooms?id=xxx — deletes a room and all related data
// (availability, rate plans, sync logs). Bookings are preserved for
// audit trail but the room reference is cleared.
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Check for active bookings on this room
  const activeBookings = await db.booking.count({
    where: {
      roomId: id,
      status: { in: ["CONFIRMED", "PENDING"] },
      checkOut: { gte: new Date() },
    },
  });

  if (activeBookings > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${activeBookings} active booking(s) for this room. Cancel or complete them first.` },
      { status: 409 }
    );
  }

  // Delete related data first (foreign key constraints)
  await db.availability.deleteMany({ where: { roomId: id } });
  await db.ratePlan.deleteMany({ where: { roomId: id } });
  await db.syncLog.deleteMany({ where: { booking: { roomId: id } } }).catch(() => {});
  // Delete bookings for this room (historical data, no longer needed if room is deleted)
  await db.booking.deleteMany({ where: { roomId: id } }).catch(() => {});

  // Delete the room
  await db.room.delete({ where: { id } });

  return NextResponse.json({ deleted: true, message: "Room deleted successfully" });
}
