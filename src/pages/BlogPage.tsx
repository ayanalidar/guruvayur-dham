"use client";

import { motion } from "framer-motion";
import { Clock, ChevronRight, BookOpen, ArrowUpRight, MessageCircle } from "lucide-react";
import { BLOG_POSTS, waLink, type BlogPost } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, TiltCard, MagneticButton, MandalaDivider, SectionHeader } from "@/components/site/visuals";

export default function BlogPage() {
  const { navigate } = useHashRoute();
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Travel Guide & Blog"
        icon={BookOpen}
        title={<>Guruvayur Pilgrim <GoldFoilText>Knowledge Hub</GoldFoilText></>}
        subtitle="Everything you need to know before your visit · darshan timings, dress code, travel routes, festival calendars, and booking tips."
        crumbs={[{ label: "Home", route: "/" }, { label: "Blog" }]}
      />

      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x">
          {/* Featured post */}
          <TiltCard maxTilt={4}>
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate(`/blog/${featured.slug}`)}
              className="card-luxe group grid w-full overflow-hidden text-left lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent lg:bg-gradient-to-r" />
                <span className="absolute left-4 top-4 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
                  Featured · {featured.category}
                </span>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-10">
                <div className="flex items-center gap-3 text-xs text-ivory/50">
                  <span>{featured.date}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
                </div>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-ivory group-hover:text-champagne sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-base text-ivory/60">{featured.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-champagne">
                  Read Article <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          </TiltCard>

          {/* Rest grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <BlogCard key={post.slug} post={post} onClick={() => navigate(`/blog/${post.slug}`)} delay={i * 0.05} />
            ))}
          </div>

          <MandalaDivider />

          {/* CTA */}
          <div className="rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center sm:p-10">
            <SectionHeader
              eyebrow="Still Curious?"
              title={<>Have a Question Not <GoldFoilText>Covered Here?</GoldFoilText></>}
              subtitle="Our front desk is on WhatsApp 24×7. Ask us anything about Guruvayur · darshan, dress code, travel, room availability, or festival planning."
            />
            <div className="mt-6 flex justify-center">
              <MagneticButton href={waLink("Namaskaram! I have a question about visiting Guruvayur.")}>
                Ask on WhatsApp <MessageCircle className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BlogCard({ post, onClick, delay }: { post: BlogPost; onClick: () => void; delay: number }) {
  return (
    <TiltCard maxTilt={5} className="h-full">
      <motion.button
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay }}
        onClick={onClick}
        className="card-luxe group flex h-full flex-col overflow-hidden text-left"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover photo-cinematic transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-champagne/30 bg-ink/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-champagne backdrop-blur-md">
            {post.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-3 text-xs text-ivory/50">
            <span>{post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
          </div>
          <h3 className="font-serif text-lg leading-snug text-ivory line-clamp-2 group-hover:text-champagne">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-ivory/60 line-clamp-3">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-champagne">
            Read More <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </motion.button>
    </TiltCard>
  );
}
