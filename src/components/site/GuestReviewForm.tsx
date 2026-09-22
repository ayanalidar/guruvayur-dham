"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { ROOMS } from "@/lib/site-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * GuestReviewForm — public review submission form embedded inside the
 * ReviewsWidget section. Submits to /api/reviews/submit (public POST).
 *
 * Fields: name, rating (1-5 stars), text, optional email/phone, optional
 * room + stay date + booking reference (booking ref drives the "Verified
 * Stay" badge shown next to the review on the public site).
 *
 * UX: shows success toast + clears the form on submit. The review stays
 * pending moderation until an admin publishes it from /admin/hub → Reviews.
 */
export default function GuestReviewForm({ defaultRoomSlug }: { defaultRoomSlug?: string }) {
  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "",
    authorPhone: "",
    rating: 5,
    text: "",
    roomSlug: defaultRoomSlug || "",
    stayDate: "",
    bookingRef: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!form.authorName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!form.text.trim() || form.text.trim().length < 10) {
      toast.error("Please write at least a 10-character review");
      return;
    }
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      toast.error("Please pick a star rating");
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
      if (!r.ok || j.error) {
        toast.error(j.error || "Could not submit review");
      } else {
        toast.success("Review submitted · thank you! 🙏");
        setSubmitted(true);
        // Reset form for next time the user opens it.
        setForm({
          authorName: "",
          authorEmail: "",
          authorPhone: "",
          rating: 5,
          text: "",
          roomSlug: defaultRoomSlug || "",
          stayDate: "",
          bookingRef: "",
        });
        // Reset the success banner after 6 seconds so users can write another.
        setTimeout(() => setSubmitted(false), 6000);
      }
    } catch {
      toast.error("Network error · please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-champagne/15 bg-ink-card p-6 backdrop-blur-md sm:p-8">
      <h3 className="font-serif text-xl text-ivory">Write a Review</h3>
      <p className="mt-1 text-xs text-ivory/60">
        Stayed with us? Share your experience · reviews are moderated before publishing.
      </p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 grid place-items-center rounded-xl border border-green-500/30 bg-green-500/10 p-8 text-center"
          >
            <CheckCircle2 className="h-12 w-12 text-green-300" />
            <p className="mt-3 font-serif text-lg text-ivory">Thank you for your review!</p>
            <p className="mt-1 text-xs text-ivory/60">
              It has been submitted for moderation. Once approved, it will appear above with other guest reviews.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 space-y-5"
          >
            {/* Rating */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Rating *</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-label={`Rate ${n} stars`}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        n <= (hoverRating || form.rating)
                          ? "fill-gold text-gold"
                          : "fill-ivory/10 text-ivory/20"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-ivory/40">
                {form.rating === 5 && "⭐ Excellent! We're so glad."}
                {form.rating === 4 && "😊 Very good · thank you!"}
                {form.rating === 3 && "🙂 Good · we appreciate your feedback."}
                {form.rating === 2 && "😐 We're sorry we didn't meet expectations."}
                {form.rating === 1 && "😞 We'd like to make it right · please WhatsApp us."}
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Name *</label>
              <input
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Rajesh Sharma"
                className="review-input mt-1"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Email (optional)</label>
                <input
                  type="email"
                  value={form.authorEmail}
                  onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                  placeholder="rajesh@example.com"
                  className="review-input mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Phone (optional)</label>
                <input
                  value={form.authorPhone}
                  onChange={(e) => setForm({ ...form, authorPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="review-input mt-1"
                />
              </div>
            </div>

            {/* Room + Stay date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Type (optional)</label>
                <select
                  value={form.roomSlug}
                  onChange={(e) => setForm({ ...form, roomSlug: e.target.value })}
                  className="review-input mt-1"
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
                  className="review-input mt-1"
                />
              </div>
            </div>

            {/* Booking reference (for Verified Stay badge) */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">
                Booking Reference (optional · adds "Verified Stay" badge)
              </label>
              <input
                value={form.bookingRef}
                onChange={(e) => setForm({ ...form, bookingRef: e.target.value.toUpperCase() })}
                placeholder="GD-XXXXXXXX"
                className="review-input mt-1"
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-ivory/40">
                <ShieldCheck className="h-3 w-3" />
                Add your booking reference (and the phone you booked with) to get a verified-stay badge on your review.
              </p>
            </div>

            {/* Review text */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ivory/50">
                Your Review * <span className="text-ivory/30">({form.text.length}/2000)</span>
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value.slice(0, 2000) })}
                rows={5}
                placeholder="Tell us about your stay · the room, the service, the location, your darshan experience…"
                className="review-input review-textarea mt-1 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ivory/40">
                Reviews are moderated before publishing · we'll notify you when it's live.
              </p>
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="btn-luxe disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Review <Send className="h-4 w-4" /></>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        :global(.review-input) {
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
        :global(.review-input::placeholder) { color: rgba(168, 155, 140, 0.5); }
        :global(.review-input:focus) { border-color: rgba(212, 196, 168, 0.4); }
        :global(.review-textarea) { min-height: 110px; }
      `}</style>
    </div>
  );
}
