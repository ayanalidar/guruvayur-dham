import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CmsTypeEnum = z.enum([
  "features",
  "events",
  "testimonials",
  "faqs",
  "trustBadges",
  "poojas",
  "carousel",
  "blogPosts",
]);

const CreateCmsSchema = z.object({
  type: CmsTypeEnum,
  data: z.record(z.string(), z.any()),
});

const UpdateCmsSchema = z.object({
  type: CmsTypeEnum,
  id: z.string().min(1),
  data: z.record(z.string(), z.any()),
});

/**
 * GET /api/cms?type=events
 * Fetches editable content by type
 * Types: features, events, testimonials, faqs, trustBadges, poojas, carousel, blogPosts
 */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  let data: any[] = [];
  switch (type) {
    case "features":
      data = await db.feature.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "events":
      data = await db.event.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "testimonials":
      data = await db.testimonial.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "faqs":
      data = await db.fAQItem.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "trustBadges":
      data = await db.trustBadge.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "poojas":
      data = await db.pooja.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "carousel":
      data = await db.carouselSlide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
      break;
    case "blogPosts":
      data = await db.blogPost.findMany({ where: { published: true }, orderBy: { date: "desc" } });
      break;
    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }

  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

/**
 * POST /api/cms — Create
 * body: { type, data: { ...fields } }
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateCmsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, data } = parsed.data;
  let item: any;
  switch (type) {
    case "features": item = await db.feature.create({ data: data as any }); break;
    case "events": item = await db.event.create({ data: { ...data, dateISO: data.dateISO ? new Date(data.dateISO) : null } as any }); break;
    case "testimonials": item = await db.testimonial.create({ data: data as any }); break;
    case "faqs": item = await db.fAQItem.create({ data: data as any }); break;
    case "trustBadges": item = await db.trustBadge.create({ data: data as any }); break;
    case "poojas": item = await db.pooja.create({ data: data as any }); break;
    case "carousel": item = await db.carouselSlide.create({ data: data as any }); break;
    case "blogPosts":
      // `content` is an array of paragraphs from the editor; serialize to JSON string
      item = await db.blogPost.create({
        data: {
          ...data,
          content: Array.isArray(data.content)
            ? JSON.stringify(data.content)
            : (typeof data.content === "string" ? data.content : "[]"),
          published: data.published !== undefined ? data.published : true,
        } as any,
      });
      break;
    default: return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
  return NextResponse.json({ item, message: "Added" });
}

/**
 * PATCH /api/cms — Update
 * body: { type, id, data: { ...fields } }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateCmsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, id, data } = parsed.data;
  let item: any;
  switch (type) {
    case "features": item = await db.feature.update({ where: { id }, data: data as any }); break;
    case "events": item = await db.event.update({ where: { id }, data: { ...data, dateISO: data.dateISO ? new Date(data.dateISO) : undefined } as any }); break;
    case "testimonials": item = await db.testimonial.update({ where: { id }, data: data as any }); break;
    case "faqs": item = await db.fAQItem.update({ where: { id }, data: data as any }); break;
    case "trustBadges": item = await db.trustBadge.update({ where: { id }, data: data as any }); break;
    case "poojas": item = await db.pooja.update({ where: { id }, data: data as any }); break;
    case "carousel": item = await db.carouselSlide.update({ where: { id }, data: data as any }); break;
    case "blogPosts":
      item = await db.blogPost.update({
        where: { id },
        data: {
          ...data,
          content: Array.isArray(data.content)
            ? JSON.stringify(data.content)
            : (data.content !== undefined ? data.content : undefined),
        } as any,
      });
      break;
    default: return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
  return NextResponse.json({ item, message: "Updated" });
}

/**
 * DELETE /api/cms?type=xxx&id=yyy
 */
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");
  if (!type || !id) return NextResponse.json({ error: "type and id required" }, { status: 400 });

  switch (type) {
    case "features": await db.feature.delete({ where: { id } }); break;
    case "events": await db.event.delete({ where: { id } }); break;
    case "testimonials": await db.testimonial.delete({ where: { id } }); break;
    case "faqs": await db.fAQItem.delete({ where: { id } }); break;
    case "trustBadges": await db.trustBadge.delete({ where: { id } }); break;
    case "poojas": await db.pooja.delete({ where: { id } }); break;
    case "carousel": await db.carouselSlide.delete({ where: { id } }); break;
    case "blogPosts": await db.blogPost.delete({ where: { id } }); break;
    default: return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
  return NextResponse.json({ deleted: true });
}
