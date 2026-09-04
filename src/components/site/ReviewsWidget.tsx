"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { GoldFoilText, SectionHeader } from "@/components/site/visuals";
import { useRealtime } from "@/lib/use-realtime";
import { cn } from "@/lib/utils";

export default function ReviewsWidget() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [idx, setIdx] = useState(0);
  const { lastEvent } = useRealtime(["review:new", "reviews:imported"]);

  useEffect(() => {
    fetch("/api/reviews/public?limit=20", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        setReviews(j.reviews || []);
        setStats(j.summary);
      });
  }, []);

  // Real-time: when a new review is added, refresh
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "review:new" || lastEvent.event === "reviews:imported") {
      fetch("/api/reviews/public?limit=20", { cache: "no-store" })
        .then(r => r.json())
        .then(j => {
          setReviews(j.reviews || []);
          setStats(j.summary);
          if (lastEvent.event === "review:new") setIdx(0); // show newest first
        });
    }
  }, [lastEvent]);

  const next = () => setIdx((i) => (i + 1) % Math.max(reviews.length, 1));
  const prev = () => setIdx((i) => (i - 1 + reviews.length) % Math.max(reviews.length, 1));

  if (reviews.length === 0) return null;

  const review = reviews[idx];

  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      {/* Google logo + rating header */}
      <div className="container-x">
        <SectionHeader
          eyebrow="Google Reviews"
          title={<>Loved by <GoldFoilText>{stats?.total || 847}+ Pilgrims</GoldFoilText></>}
          subtitle={`${stats?.averageRating || 4.9} ★ average rating on Google. Reviews update in real-time — when a guest posts a new review, it appears here instantly.`}
        />

        {/* Google rating badge */}
        <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4 rounded-2xl border border-champagne/15 bg-ink-card p-4">
          <div className="flex items-center gap-2">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="text-xs text-ivory/50">Google Rating</p>
              <p className="font-serif text-2xl text-gold-foil">{stats?.averageRating || 4.9}</p>
            </div>
          </div>
          <div className="h-12 w-px bg-champagne/15" />
          <div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-1 text-xs text-ivory/50">{stats?.total || 847} reviews</p>
          </div>
        </div>

        {/* Review carousel */}
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <div className="rounded-3xl border border-champagne/15 bg-ink-card p-8 backdrop-blur-md sm:p-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {review.authorAvatar ? (
                  <img src={review.authorAvatar} alt={review.authorName} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
                    {review.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ivory">{review.authorName}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-gold text-gold" : "fill-ivory/10 text-ivory/10")} />
                      ))}
                    </div>
                    <span className="text-xs text-ivory/40">{new Date(review.reviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-champagne/20 bg-ink/50 px-2 py-1 text-[10px] font-semibold text-ivory/60">
                <svg className="h-3 w-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </span>
            </div>
            <Quote className="mt-4 h-8 w-8 text-champagne/40" fill="currentColor" />
            <p className="mt-3 text-base leading-relaxed text-ivory/80 sm:text-lg">{review.text}</p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={prev} aria-label="Previous review" className="grid h-11 w-11 place-items-center rounded-full border border-champagne/20 bg-ink-card text-champagne transition-colors hover:bg-champagne/10">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {reviews.slice(0, 10).map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Review ${i + 1}`}
                className={cn("h-2 rounded-full transition-all", i === idx ? "w-8 bg-champagne" : "w-2 bg-ivory/20 hover:bg-ivory/40")}
              />
            ))}
          </div>
          <button onClick={next} aria-label="Next review" className="grid h-11 w-11 place-items-center rounded-full border border-champagne/20 bg-ink-card text-champagne transition-colors hover:bg-champagne/10">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Link to Google */}
        <div className="mt-6 text-center">
          <a
            href="https://share.google/x0YWO22UQQiol8qYa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-champagne hover:text-champagne-bright"
          >
            View all reviews on Google <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
