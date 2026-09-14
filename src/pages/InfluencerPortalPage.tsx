"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, DollarSign, Share2, Check, ChevronRight,
  Youtube, Instagram, Twitter, FileText, Loader2, Gift, Star,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, SectionHeader } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InfluencerPortalPage() {
  const { navigate } = useHashRoute();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", socialPlatform: "YOUTUBE",
    socialHandle: "", followerCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.socialHandle) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
      } else {
        setSubmitted(true);
        toast.success("Application submitted!");
      }
    } catch {
      toast.error("Submission failed");
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
          <h2 className="mt-4 font-serif text-3xl text-ivory">Application Received!</h2>
          <p className="mt-2 text-sm text-ivory/60">
            Thank you for your interest in becoming a Guruvayur Dham influencer partner.
            We'll review your application and get back to you within 48 hours.
          </p>
          <p className="mt-1 text-xs text-ivory/40">
            Once approved, you'll receive a unique referral code and access to your dashboard.
          </p>
          <div className="mt-6">
            <MagneticButton onClick={() => navigate("/")}>Back to Home</MagneticButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Influencer Portal"
        icon={Share2}
        title={<>Become a <GoldFoilText>Guruvayur Dham</GoldFoilText> Partner</>}
        subtitle="Travel influencers, bloggers, and content creators · earn commission on every booking referred through your unique link."
        crumbs={[{ label: "Home", route: "/" }, { label: "Influencer Portal" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x max-w-4xl">
          {/* Benefits */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: DollarSign, title: "10% Commission", desc: "On every booking made through your link" },
              { icon: Users, title: "Track Clicks", desc: "Real-time dashboard with clicks, conversions, and earnings" },
              { icon: Gift, title: "Free Stays", desc: "Top performers get complimentary room nights" },
            ].map((b, i) => (
              <div key={i} className="card-luxe p-5">
                <b.icon className="h-6 w-6 text-champagne" />
                <p className="mt-2 font-serif text-base text-ivory">{b.title}</p>
                <p className="text-xs text-ivory/50">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-8 rounded-2xl border border-champagne/15 bg-ink-card p-6">
            <h3 className="font-serif text-xl text-ivory">How It Works</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              {[
                { step: 1, title: "Apply", desc: "Fill the form below" },
                { step: 2, title: "Get Approved", desc: "Within 48 hours" },
                { step: 3, title: "Share Link", desc: "Post your unique URL" },
                { step: 4, title: "Earn", desc: "10% per booking" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
                    {s.step}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ivory">{s.title}</p>
                  <p className="text-xs text-ivory/50">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application form */}
          <div className="mt-8 card-luxe p-6 sm:p-8">
            <h3 className="font-serif text-2xl text-ivory">Apply Now</h3>
            <p className="mt-1 text-sm text-ivory/60">Fill in your details. We'll review and respond within 48 hours.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" className="input-luxe mt-1" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input-luxe mt-1" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="input-luxe mt-1" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Social Platform *</label>
                <select value={form.socialPlatform} onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })} className="input-luxe mt-1">
                  <option value="YOUTUBE">YouTube</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TWITTER">Twitter / X</option>
                  <option value="BLOG">Blog</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Social Handle *</label>
                <input value={form.socialHandle} onChange={(e) => setForm({ ...form, socialHandle: e.target.value })} placeholder="@yourhandle" className="input-luxe mt-1" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Follower Count</label>
                <input type="number" value={form.followerCount || ""} onChange={(e) => setForm({ ...form, followerCount: parseInt(e.target.value) || 0 })} placeholder="50000" className="input-luxe mt-1" />
              </div>
            </div>

            <button onClick={submit} disabled={loading} className="btn-luxe mt-6 w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Application <ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4 text-center">
              <p className="font-serif text-3xl text-gold-foil">10%</p>
              <p className="text-xs text-ivory/50">Commission per booking</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4 text-center">
              <p className="font-serif text-3xl text-gold-foil">48h</p>
              <p className="text-xs text-ivory/50">Application review time</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4 text-center">
              <p className="font-serif text-3xl text-gold-foil">∞</p>
              <p className="text-xs text-ivory/50">No earning cap</p>
            </div>
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
