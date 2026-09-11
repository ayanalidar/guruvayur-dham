import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateBlogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().max(200).optional(),
  excerpt: z.string().optional(),
  category: z.string().max(100).optional(),
  readTime: z.string().max(50).optional(),
  image: z.string().url().optional(),
  content: z.union([z.array(z.any()), z.string()]).optional(),
  published: z.boolean().optional(),
});

const UpdateBlogPostSchema = z.object({
  id: z.string().min(1),
  // SECURITY (Phase2-MassAssignment): explicit whitelist of BlogPost columns.
  // id/createdAt/updatedAt are server-controlled. Spec listed `coverImage`
  // (Prisma uses `image`) and `tags` (no such column) — adapted to real
  // Prisma field names. Content accepts string OR array (handler JSON.stringifies
  // arrays before persisting).
  data: z.object({
    title: z.string().max(300).optional(),
    slug: z.string().max(300).optional(),
    excerpt: z.string().max(1000).optional(),
    content: z.union([z.string().max(50000), z.array(z.any())]).optional(),
    image: z.string().max(2000).optional(),
    category: z.string().max(100).optional(),
    readTime: z.string().max(50).optional(),
    date: z.string().max(50).optional(),
    scheduledAt: z.coerce.date().nullable().optional(),
    seoTitle: z.string().max(300).optional(),
    seoDescription: z.string().max(500).optional(),
    seoKeywords: z.string().max(500).optional(),
    published: z.boolean().optional(),
  }).strict(),
});

// GET /api/blog-posts · list all (or by slug)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post: { ...post, content: JSON.parse(post.content) } });
  }
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ posts: posts.map(p => ({ ...p, content: JSON.parse(p.content) })) });
}

// POST /api/blog-posts · create new post
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateBlogPostSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { title, excerpt, category, readTime, image, content, published } = parsed.data;
  const slug = parsed.data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const post = await db.blogPost.create({
    data: {
      slug, title, excerpt, category,
      readTime: readTime || "5 min",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      image: image || "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=500&fit=crop",
      content: JSON.stringify(content || []),
      published: published !== false,
    } as any,
  });
  return NextResponse.json({ post });
}

// PATCH /api/blog-posts · update post
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateBlogPostSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;
  if (data.content && Array.isArray(data.content)) data.content = JSON.stringify(data.content);
  // `as any` kept because Zod's inferred `content: string | any[]` union doesn't
  // narrow to `string` after the runtime Array.isArray check (mutation, not
  // narrowing). Schema still validates input — security goal met.
  const post = await db.blogPost.update({ where: { id }, data: data as any });
  return NextResponse.json({ post });
}

// DELETE /api/blog-posts?id=xxx
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
