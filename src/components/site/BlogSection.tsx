"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, ChevronRight, ArrowLeft, BookOpen } from "lucide-react";
import { BLOG_POSTS, type BlogPost } from "@/lib/site-data";
import { useContent, useCMSList, mapBlogPost, type BlogPostItem } from "@/lib/use-cms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

export default function BlogSection() {
  const { get } = useContent();
  // Blog posts: prefer CMS, fall back to hardcoded BLOG_POSTS
  const cmsPosts = useCMSList<BlogPostItem>("blogPosts", []);
  const posts: BlogPost[] = cmsPosts.length > 0 ? cmsPosts.map(mapBlogPost) : BLOG_POSTS;

  const [open, setOpen] = useState<BlogPost | null>(null);

  const eyebrow = get("blog.eyebrow", "Travel Guide & Blog");
  const title = get("blog.title", "Guruvayur Pilgrim Knowledge Hub");
  const subtitle = get(
    "blog.subtitle",
    "Everything you need to know before your visit · darshan timings, dress code, travel routes, festival calendars, and booking tips."
  );

  // Split title for gradient on second half
  const titleParts = title.split(" ");
  const titleHighlight = titleParts.length > 2 ? titleParts.slice(-2).join(" ") : "";
  const titlePre = titleHighlight ? titleParts.slice(0, -2).join(" ").trim() : title;

  return (
    <section
      id="blog"
      className="relative scroll-mt-20 overflow-hidden bg-muted/30 py-20 lg:py-28"
    >
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">
            <BookOpen className="h-3.5 w-3.5" /> {eyebrow}
          </span>
          <h2 className="section-title mt-4">
            {titlePre}{" "}
            {titleHighlight && <span className="text-gradient-saffron">{titleHighlight}</span>}
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </div>

        {/* Featured grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setOpen(post)}
              className="card-warm group flex cursor-pointer flex-col overflow-hidden hover:shadow-warm-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute left-3 top-3 rounded-full bg-saffron px-3 py-1 text-xs font-bold text-white shadow-warm">
                  {post.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-lg leading-snug text-foreground line-clamp-2 group-hover:text-saffron-dark">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron-dark">
                  Read More
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => scrollTo("contact")}
            className="inline-flex items-center gap-2 rounded-full border border-saffron bg-card px-6 py-3 text-sm font-semibold text-saffron-dark transition-colors hover:bg-saffron/10"
          >
            Have a question not covered here? Ask us
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Article dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl">
          {open && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>{open.excerpt}</DialogDescription>
              </DialogHeader>

              <div className="relative aspect-[16/8] w-full overflow-hidden">
                <Image
                  src={open.image}
                  alt={open.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="inline-block rounded-full bg-saffron px-3 py-1 text-xs font-bold">
                    {open.category}
                  </span>
                  <h2 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">
                    {open.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-3 text-xs text-cream/90">
                    <span>{open.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {open.readTime} read
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 sm:p-7">
                {open.content.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {para}
                  </p>
                ))}

                {/* Internal links */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                  <button
                    onClick={() => {
                      setOpen(null);
                      setTimeout(() => scrollTo("rooms"), 200);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-saffron/10 px-4 py-2 text-xs font-semibold text-saffron-dark hover:bg-saffron/20"
                  >
                    View Rooms <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setOpen(null);
                      setTimeout(() => scrollTo("pooja"), 200);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-maroon/10 px-4 py-2 text-xs font-semibold text-maroon hover:bg-maroon/20"
                  >
                    Book a Pooja <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setOpen(null);
                      setTimeout(() => scrollTo("contact"), 200);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25"
                  >
                    Contact Us <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
