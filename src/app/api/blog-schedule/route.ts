import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/blog-schedule
 * Returns all scheduled posts (published + scheduled + draft)
 */
export async function GET() {
  const posts = await db.blogPost.findMany({
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({
    posts: posts.map(p => ({
      ...p,
      content: JSON.parse(p.content),
      scheduled: p.scheduledAt && !p.published,
      dueForPublish: p.scheduledAt && !p.published && p.scheduledAt <= new Date(),
    })),
  });
}

/**
 * POST /api/blog-schedule
 * Schedule a post for auto-publish
 * body: { postId, scheduledAt }
 */
export async function POST(req: NextRequest) {
  const { postId, scheduledAt } = await req.json();

  const post = await db.blogPost.update({
    where: { id: postId },
    data: {
      scheduledAt: new Date(scheduledAt),
      published: false, // unpublish until scheduled time
    },
  });

  // Broadcast
  fetch("http://localhost:3003/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "blog:scheduled",
      data: { postId, title: post.title, scheduledAt },
    }),
  }).catch(() => {});

  return NextResponse.json({
    post,
    message: `Post scheduled for ${new Date(scheduledAt).toLocaleString("en-IN")}`,
  });
}

/**
 * PATCH /api/blog-schedule
 * Process scheduled posts · publishes any posts whose scheduledAt has passed.
 * Called by a cron job or manual trigger.
 */
export async function PATCH() {
  const now = new Date();
  const duePosts = await db.blogPost.findMany({
    where: {
      scheduledAt: { lte: now },
      published: false,
    },
  });

  let published = 0;
  for (const post of duePosts) {
    await db.blogPost.update({
      where: { id: post.id },
      data: { published: true },
    });
    published++;

    // Broadcast publish event
    fetch("http://localhost:3003/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "blog:published",
        data: { postId: post.id, title: post.title, slug: post.slug },
      }),
    }).catch(() => {});
  }

  return NextResponse.json({
    processed: duePosts.length,
    published,
    nextScheduled: await db.blogPost.findFirst({
      where: { scheduledAt: { gt: now }, published: false },
      orderBy: { scheduledAt: "asc" },
      select: { title: true, scheduledAt: true, slug: true },
    }),
  });
}

/**
 * PUT /api/blog-schedule
 * Update SEO metadata for a blog post
 * body: { postId, seoTitle, seoDescription, seoKeywords }
 */
export async function PUT(req: NextRequest) {
  const { postId, seoTitle, seoDescription, seoKeywords } = await req.json();

  const post = await db.blogPost.update({
    where: { id: postId },
    data: { seoTitle, seoDescription, seoKeywords },
  });

  return NextResponse.json({ post, message: "SEO metadata updated" });
}
