import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateEventSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.string().min(1),
  dateISO: z.string().optional(),
  description: z.string().optional(),
  highlight: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

const UpdateEventSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    name: z.string().max(200).optional(),
    date: z.string().max(100).optional(),
    dateISO: z.string().optional(),
    description: z.string().max(2000).optional(),
    highlight: z.string().max(500).optional(),
    image: z.string().max(2000).optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  }),
});

export async function GET() {
  const { error } = await requireStaff(new NextRequest("http://localhost"));
  if (error) return error;
  const events = await db.event.findMany({ orderBy: { dateISO: "asc" } });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;
  const parsed = CreateEventSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const data: any = { ...parsed.data };
  if (data.dateISO) data.dateISO = new Date(data.dateISO);
  const event = await db.event.create({ data });
  return NextResponse.json({ event });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;
  const parsed = UpdateEventSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id, data } = parsed.data;
  if (data.dateISO) data.dateISO = new Date(data.dateISO) as any;
  const event = await db.event.update({ where: { id }, data });
  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;
  const { id } = await req.json();
  await db.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
