import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  const { type, data } = await req.json();
  let item: any;
  switch (type) {
    case "features": item = await db.feature.create({ data }); break;
    case "events": item = await db.event.create({ data: { ...data, dateISO: data.dateISO ? new Date(data.dateISO) : null } }); break;
    case "testimonials": item = await db.testimonial.create({ data }); break;
    case "faqs": item = await db.fAQItem.create({ data }); break;
    case "trustBadges": item = await db.trustBadge.create({ data }); break;
    case "poojas": item = await db.pooja.create({ data }); break;
    case "carousel": item = await db.carouselSlide.create({ data }); break;
    case "blogPosts":
      // `content` is an array of paragraphs from the editor; serialize to JSON string
      item = await db.blogPost.create({
        data: {
          ...data,
          content: Array.isArray(data.content)
            ? JSON.stringify(data.content)
            : (typeof data.content === "string" ? data.content : "[]"),
          published: data.published !== undefined ? data.published : true,
        },
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
  const { type, id, data } = await req.json();
  let item: any;
  switch (type) {
    case "features": item = await db.feature.update({ where: { id }, data }); break;
    case "events": item = await db.event.update({ where: { id }, data: { ...data, dateISO: data.dateISO ? new Date(data.dateISO) : undefined } }); break;
    case "testimonials": item = await db.testimonial.update({ where: { id }, data }); break;
    case "faqs": item = await db.fAQItem.update({ where: { id }, data }); break;
    case "trustBadges": item = await db.trustBadge.update({ where: { id }, data }); break;
    case "poojas": item = await db.pooja.update({ where: { id }, data }); break;
    case "carousel": item = await db.carouselSlide.update({ where: { id }, data }); break;
    case "blogPosts":
      item = await db.blogPost.update({
        where: { id },
        data: {
          ...data,
          content: Array.isArray(data.content)
            ? JSON.stringify(data.content)
            : (data.content !== undefined ? data.content : undefined),
        },
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
