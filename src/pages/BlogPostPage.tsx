"use client";

import { motion } from "framer-motion";
import { Clock, ChevronRight, ArrowLeft, Calendar, BookOpen, MessageCircle } from "lucide-react";
import { BLOG_POSTS, waLink } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { GoldFoilText, MagneticButton, MandalaDivider, OmWatermark, SectionHeader } from "@/components/site/visuals";

export default function BlogPostPage({ slug }: { slug: string }) {
  const { navigate } = useHashRoute();
  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="animate-page-reveal">
      {/* Breadcrumbs */}
      <section className="bg-ink-gradient pt-28 pb-6 lg:pt-36">
        <div className="container-x">
          <nav className="flex items-center gap-2 text-xs text-ivory/50">
            <button onClick={() => navigate("/")} className="hover:text-champagne">Home</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate("/blog")} className="hover:text-champagne">Blog</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-champagne line-clamp-1">{post.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-gradient pb-12">
        <OmWatermark className="right-[-4rem] top-0" size="16rem" />
        <div className="container-x relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-block rounded-full border border-champagne/25 bg-ink-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne">
              {post.category}
            </span>
            <h1 className="mt-5 font-serif text-4xl leading-tight text-ivory sm:text-5xl lg:text-[3.5rem]" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}>
              {post.title}
            </h1>
            <div className="mt-5 flex items-center justify-center gap-4 text-sm text-ivory/50">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {post.date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime} read</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-champagne/15 shadow-luxe-lg"
          >
            <img src={post.image} alt={post.title} className="h-full w-full object-cover photo-cinematic" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-3xl"
          >
            <p className="font-serif text-xl leading-relaxed text-ivory/90 first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-gold-foil">
              {post.excerpt}
            </p>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ivory/70">
              {post.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Internal links */}
            <div className="mt-10 flex flex-wrap gap-3 border-t border-champagne/10 pt-6">
              <button
                onClick={() => navigate("/rooms")}
                className="inline-flex items-center gap-1 rounded-full border border-champagne/25 px-4 py-2 text-xs font-semibold text-champagne hover:bg-champagne/10"
              >
                View Rooms <ChevronRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => navigate("/pooja")}
                className="inline-flex items-center gap-1 rounded-full border border-champagne/25 px-4 py-2 text-xs font-semibold text-champagne hover:bg-champagne/10"
              >
                Book a Pooja <ChevronRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-1 rounded-full border border-champagne/25 px-4 py-2 text-xs font-semibold text-champagne hover:bg-champagne/10"
              >
                Contact Us <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={() => navigate("/blog")}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-champagne hover:text-champagne-bright"
            >
              <ArrowLeft className="h-4 w-4" /> Back to All Articles
            </button>
          </motion.article>
        </div>
      </section>

      <MandalaDivider />

      {/* Related */}
      <section className="bg-ink pb-20">
        <div className="container-x">
          <SectionHeader
            eyebrow="Keep Reading"
            title={<>Related <GoldFoilText>Articles</GoldFoilText></>}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <motion.button
                key={p.slug}
                onClick={() => navigate(`/blog/${p.slug}`)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="card-luxe group block overflow-hidden text-left"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                </div>
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-champagne/70">{p.category}</p>
                  <h3 className="mt-1 font-serif text-lg text-ivory line-clamp-2 group-hover:text-champagne">{p.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center">
            <p className="font-serif text-2xl text-ivory">Ready to plan your Guruvayur visit?</p>
            <p className="mt-2 text-sm text-ivory/60">Book your luxury stay with us · 2 minutes from East Nada.</p>
            <div className="mt-5 flex justify-center">
              <MagneticButton href={waLink("Namaskaram! I just read your blog and want to book a room at Guruvayur Dham.")}>
                <MessageCircle className="h-4 w-4" /> Book Now
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
