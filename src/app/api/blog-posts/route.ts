import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  const body = await req.json();
  const { title, excerpt, category, readTime, image, content, published } = body;
  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const post = await db.blogPost.create({
    data: {
      slug, title, excerpt, category,
      readTime: readTime || "5 min",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      image: image || "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=500&fit=crop",
      content: JSON.stringify(content || []),
      published: published !== false,
    },
  });
  return NextResponse.json({ post });
}

// PATCH /api/blog-posts · update post
export async function PATCH(req: NextRequest) {
  const { id, data } = await req.json();
  if (data.content && Array.isArray(data.content)) data.content = JSON.stringify(data.content);
  const post = await db.blogPost.update({ where: { id }, data });
  return NextResponse.json({ post });
}

// DELETE /api/blog-posts?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
