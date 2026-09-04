"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, ChevronRight, Home, MessageSquare, Loader2 } from "lucide-react";
import { ROOMS } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReviewSubmitPage() {
  const { navigate } = useHashRoute();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "",
    authorPhone: "",
    rating: 5,
    text: "",
    roomSlug: "",
    stayDate: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  const submit = async () => {
    if (!form.authorName || !form.text) {
      toast.error("Please enter your name and review");
      return;
    }
    if (form.text.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
      } else {
        setSubmitted(true);
        toast.success("Review submitted! Thank you.");
      }
    } catch {
      toast.error("Failed to submit review");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="animate-page-reveal min-h-[80vh] grid place-items-center bg-ink px-4 pt-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-green-500/30 bg-green-500/15">
            <Check className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-ivory">Thank You!</h2>
          <p className="mt-2 text-sm text-ivory/60">
            Your review has been submitted for moderation. Once approved by our team, it will appear on our website alongside other guest reviews.
          </p>
          <p className="mt-1 text-xs text-ivory/40">
            We appreciate you taking the time to share your experience. 🙏
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <MagneticButton onClick={() => navigate("/")}>Back to Home</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => { setSubmitted(false); setForm({ authorName: "", authorEmail: "", authorPhone: "", rating: 5, text: "", roomSlug: "", stayDate: "" }); }}>Write Another</MagneticButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Share Your Experience"
        icon={MessageSquare}
        title={<>Write a <GoldFoilText>Review</GoldFoilText></>}
        subtitle="Stayed with us? We'd love to hear about your experience. Your review helps other pilgrims discover Guruvayur Dham."
        crumbs={[{ label: "Home", route: "/" }, { label: "Write Review" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x max-w-2xl">
          <div className="card-luxe p-6 sm:p-8">
            {/* Rating */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Rating *</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm({ ...form, rating: n })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        n <= (hoverRating || form.rating)
                          ? "fill-gold text-gold"
                          : "fill-ivory/10 text-ivory/20"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-ivory/40">
                {form.rating === 5 && "⭐ Excellent! We're so glad you loved it."}
                {form.rating === 4 && "😊 Very good — thank you!"}
                {form.rating === 3 && "🙂 Good — we appreciate your feedback."}
                {form.rating === 2 && "😐 We're sorry we didn't meet expectations."}
                {form.rating === 1 && "😞 We'd like to make it right — please WhatsApp us."}
              </p>
            </div>

            {/* Name */}
            <div className="mt-6">
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Name *</label>
              <input
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Rajesh Menon"
                className="input-luxe mt-1"
              />
            </div>

            {/* Email + Phone */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Email (optional)</label>
                <input
                  type="email"
                  value={form.authorEmail}
                  onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                  placeholder="rajesh@example.com"
                  className="input-luxe mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Phone (optional)</label>
                <input
                  value={form.authorPhone}
                  onChange={(e) => setForm({ ...form, authorPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input-luxe mt-1"
                />
              </div>
            </div>

            {/* Room + Stay date */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Type (optional)</label>
                <select
                  value={form.roomSlug}
                  onChange={(e) => setForm({ ...form, roomSlug: e.target.value })}
                  className="input-luxe mt-1"
                >
                  <option value="">Select room…</option>
                  {ROOMS.map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Stay Date (optional)</label>
                <input
                  type="date"
                  value={form.stayDate}
                  onChange={(e) => setForm({ ...form, stayDate: e.target.value })}
                  className="input-luxe mt-1"
                />
              </div>
            </div>

            {/* Review text */}
            <div className="mt-6">
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Review * <span className="text-ivory/30">({form.text.length}/2000)</span></label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value.slice(0, 2000) })}
                rows={5}
                placeholder="Tell us about your stay — the room, the service, the location, your darshan experience, anything that made your visit special…"
                className="input-luxe mt-1 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ivory/40">
                Reviews are moderated before publishing. We'll notify you when it's live.
              </p>
              <div className="flex gap-2">
                <button onClick={() => navigate("/")} className="btn-ghost-luxe">
                  <Home className="h-4 w-4" /> Cancel
                </button>
                <button onClick={submit} disabled={loading} className="btn-luxe disabled:opacity-40">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Review <ChevronRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div className="mt-6 rounded-2xl border border-champagne/15 bg-ink-card p-5 text-center">
            <p className="text-sm text-ivory/70">
              <Star className="mr-1 inline h-4 w-4 fill-gold text-gold" />
              <strong className="text-ivory">4.9 ★</strong> from 847+ Google reviews. Your review helps fellow pilgrims discover Guruvayur Dham.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(.input-luxe) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(212, 196, 168, 0.15);
          background: rgba(15, 10, 8, 0.5);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #F5EFE6;
          outline: none;
          transition: border-color 0.2s;
        }
        :global(.input-luxe::placeholder) { color: rgba(168, 155, 140, 0.5); }
        :global(.input-luxe:focus) { border-color: rgba(212, 196, 168, 0.4); }
      `}</style>
    </div>
  );
}
