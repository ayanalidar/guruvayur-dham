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

// SECURITY (Phase2-MassAssignment): per-type explicit whitelists for the CMS
// `data` blob. Each schema lists ONLY the user-editable columns of the
// corresponding Prisma model — id/createdAt/updatedAt are server-controlled
// and would be rejected by .strict() if an attacker tried to override them.
//
// Required-vs-optional matches the Prisma model: NOT NULL columns with no
// @default are required on POST (create); PATCH uses .partial() so every
// field is optional (only the supplied fields are updated).

const FeaturesDataSchema = z.object({
  icon: z.string().max(100),
  title: z.string().max(200),
  text: z.string().max(5000),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const EventsDataSchema = z.object({
  name: z.string().max(200),
  date: z.string().max(100),
  dateISO: z.coerce.date().nullable().optional(),
  description: z.string().max(5000),
  highlight: z.string().max(500),
  image: z.string().max(2000),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const TestimonialsDataSchema = z.object({
  name: z.string().max(200),
  city: z.string().max(100),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  text: z.string().max(5000),
  room: z.string().max(200).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const FaqsDataSchema = z.object({
  question: z.string().max(500),
  answer: z.string().max(5000),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const TrustBadgesDataSchema = z.object({
  icon: z.string().max(100),
  text: z.string().max(200),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const PoojasDataSchema = z.object({
  name: z.string().max(200),
  price: z.coerce.number().min(0),
  duration: z.string().max(100),
  description: z.string().max(5000),
  prasadam: z.string().max(500),
  image: z.string().max(2000),
  significance: z.string().max(2000),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const CarouselDataSchema = z.object({
  title: z.string().max(200),
  subtitle: z.string().max(500).nullable().optional(),
  image: z.string().max(2000),
  ctaText: z.string().max(100).nullable().optional(),
  ctaLink: z.string().max(500).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
}).strict();

const BlogPostsDataSchema = z.object({
  slug: z.string().max(300),
  title: z.string().max(300),
  excerpt: z.string().max(2000),
  category: z.string().max(100),
  readTime: z.string().max(50),
  date: z.string().max(50),
  image: z.string().max(2000),
  content: z.union([z.string().max(50000), z.array(z.any())]),
  published: z.boolean().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  seoTitle: z.string().max(300).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().max(500).optional(),
}).strict();

// Lookup table — type → create-schema (required fields per Prisma model).
const CmsCreateDataSchemas = {
  features: FeaturesDataSchema,
  events: EventsDataSchema,
  testimonials: TestimonialsDataSchema,
  faqs: FaqsDataSchema,
  trustBadges: TrustBadgesDataSchema,
  poojas: PoojasDataSchema,
  carousel: CarouselDataSchema,
  blogPosts: BlogPostsDataSchema,
} as const;

// Lookup table — type → patch-schema (all fields optional, .strict() preserved).
// .partial() on a strict ZodObject returns a strict ZodObject with all-optional fields.
const CmsPatchDataSchemas = {
  features: FeaturesDataSchema.partial(),
  events: EventsDataSchema.partial(),
  testimonials: TestimonialsDataSchema.partial(),
  faqs: FaqsDataSchema.partial(),
  trustBadges: TrustBadgesDataSchema.partial(),
  poojas: PoojasDataSchema.partial(),
  carousel: CarouselDataSchema.partial(),
  blogPosts: BlogPostsDataSchema.partial(),
} as const;

const CreateCmsSchema = z.object({
  type: CmsTypeEnum,
  // data validated per-type inside POST handler using CmsCreateDataSchemas.
  data: z.record(z.string(), z.unknown()),
});

const UpdateCmsSchema = z.object({
  type: CmsTypeEnum,
  id: z.string().min(1),
  // data validated per-type inside PATCH handler using CmsPatchDataSchemas.
  data: z.record(z.string(), z.unknown()),
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
  const { type, data: rawData } = parsed.data;
  // SECURITY (Phase2-MassAssignment): validate the per-type `data` blob against
  // an explicit whitelist of the corresponding Prisma model's columns. .strict()
  // rejects unknown fields (id/createdAt/updatedAt, financial totals, etc.).
  const typedResult = CmsCreateDataSchemas[type].safeParse(rawData);
  if (!typedResult.success) {
    return NextResponse.json(
      { error: `Invalid data for type "${type}"`, details: typedResult.error.flatten() },
      { status: 400 }
    );
  }
  // Cast to any: the per-type schema has already validated the shape at runtime;
  // TS can't narrow the union type returned by the lookup table inside switch.
  const data: any = typedResult.data;
  let item: any;
  switch (type) {
    case "features": item = await db.feature.create({ data }); break;
    case "events": item = await db.event.create({ data: { ...data, dateISO: data.dateISO ?? null } }); break;
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
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateCmsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { type, id, data: rawData } = parsed.data;
  // SECURITY (Phase2-MassAssignment): validate the per-type `data` blob against
  // an explicit whitelist of the corresponding Prisma model's columns. .strict()
  // rejects unknown fields (id/createdAt/updatedAt, financial totals, etc.).
  const typedResult = CmsPatchDataSchemas[type].safeParse(rawData);
  if (!typedResult.success) {
    return NextResponse.json(
      { error: `Invalid data for type "${type}"`, details: typedResult.error.flatten() },
      { status: 400 }
    );
  }
  // Cast to any: the per-type schema has already validated the shape at runtime;
  // TS can't narrow the union type returned by the lookup table inside switch.
  const data: any = typedResult.data;
  let item: any;
  switch (type) {
    case "features": item = await db.feature.update({ where: { id }, data }); break;
    case "events": item = await db.event.update({ where: { id }, data: { ...data, dateISO: data.dateISO !== undefined ? data.dateISO : undefined } }); break;
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
