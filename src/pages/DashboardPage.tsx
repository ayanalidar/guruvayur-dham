"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon, Calendar, Star, Award, Settings, LogOut, ChevronRight,
  Phone, Mail, MapPin, Gift, Clock, Loader2,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { navigate } = useHashRoute();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(r => r.json())
      .then(async j => {
        if (!active) return;
        if (!j.authenticated || j.role !== "GUEST") {
          navigate("/login");
          return;
        }
        setUser(j.user);
        // Fetch bookings for this user (by phone or email)
        const phone = j.user.phone || "";
        const email = j.user.email || "";
        const r2 = await fetch(`/api/bookings?search=${encodeURIComponent(phone || email)}`, { cache: "no-store" });
        const j2 = await r2.json();
        setBookings(j2.bookings || []);
        // Fetch customer record
        if (j.user.phone) {
          const r3 = await fetch(`/api/customers?search=${encodeURIComponent(j.user.phone)}`, { cache: "no-store" });
          const j3 = await r3.json();
          if (j3.customers?.length > 0) setCustomer(j3.customers[0]);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [navigate]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-ink pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-champagne" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="My Account"
        icon={UserIcon}
        title={<>Welcome, <GoldFoilText>{user.name}</GoldFoilText></>}
        subtitle="Manage your bookings, track loyalty points, and view your pilgrimage history."
        crumbs={[{ label: "Home", route: "/" }, { label: "Dashboard" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile card */}
            <div className="lg:col-span-1">
              <div className="card-luxe p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-2xl text-gold-foil">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-lg text-ivory">{user.name}</p>
                    <p className="text-xs text-ivory/50">Guest Member</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {user.email && <p className="flex items-center gap-2 text-ivory/70"><Mail className="h-4 w-4 text-champagne" /> {user.email}</p>}
                  {user.phone && <p className="flex items-center gap-2 text-ivory/70"><Phone className="h-4 w-4 text-champagne" /> {user.phone}</p>}
                  <p className="flex items-center gap-2 text-ivory/70"><Clock className="h-4 w-4 text-champagne" /> Joined {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                </div>

                {/* Loyalty points */}
                {customer && (
                  <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-gold" />
                        <span className="text-xs uppercase tracking-wider text-ivory/50">Loyalty Points</span>
                      </div>
                      <span className="font-serif text-2xl text-gold-foil">{customer.loyaltyPoints}</span>
                    </div>
                    <p className="mt-1 text-xs text-ivory/50">{customer.totalBookings} bookings · ₹{customer.totalRevenue.toLocaleString("en-IN")} spent</p>
                    <p className="mt-1 text-[10px] text-ivory/40">5 points = free night (₹1500 cap)</p>
                  </div>
                )}

                <button onClick={logout} className="mt-4 w-full rounded-full border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10">
                  <LogOut className="mr-2 inline h-4 w-4" /> Logout
                </button>
              </div>

              {/* Quick actions */}
              <div className="mt-4 space-y-2">
                <MagneticButton onClick={() => navigate("/book")} className="w-full">Book a Room <ChevronRight className="h-4 w-4" /></MagneticButton>
                <MagneticButton variant="ghost" onClick={() => navigate("/pooja")} className="w-full">Book a Pooja <ChevronRight className="h-4 w-4" /></MagneticButton>
                <MagneticButton variant="ghost" onClick={() => navigate("/tour")} className="w-full">Virtual Tour <ChevronRight className="h-4 w-4" /></MagneticButton>
              </div>
            </div>

            {/* Bookings list */}
            <div className="lg:col-span-2">
              <h2 className="mb-4 font-serif text-2xl text-ivory">Your Bookings</h2>
              {bookings.length === 0 ? (
                <div className="card-luxe p-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-ivory/30" />
                  <p className="mt-3 text-sm text-ivory/60">No bookings yet.</p>
                  <p className="text-xs text-ivory/40">Book your first stay to see it here.</p>
                  <MagneticButton onClick={() => navigate("/book")} className="mt-4">Book Now</MagneticButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-luxe p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-xs text-champagne">{b.reference}</p>
                          <p className="font-serif text-lg text-ivory">{b.room?.name}</p>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ivory/50">
                            <span><Calendar className="mr-1 inline h-3 w-3" /> {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                            <span>· {b.nights} night{b.nights > 1 ? "s" : ""}</span>
                            <span>· {b.guests} guests</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl text-gold-foil">₹{b.amount.toLocaleString("en-IN")}</p>
                          <span className={cn(
                            "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            b.status === "CONFIRMED" && "bg-green-500/15 text-green-300",
                            b.status === "CHECKED_IN" && "bg-blue-500/15 text-blue-300",
                            b.status === "CHECKED_OUT" && "bg-ivory/10 text-ivory/60",
                            b.status === "CANCELLED" && "bg-red-500/15 text-red-300"
                          )}>{b.status.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      {b.source !== "DIRECT" && (
                        <p className="mt-2 text-xs text-ivory/40">Booked via {b.source.replace(/_/g, " ")}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reviews section */}
              <h2 className="mb-4 mt-8 font-serif text-2xl text-ivory">Recent Reviews</h2>
              <ReviewsWidget limit={3} />

              {/* Benefits */}
              <div className="mt-8 rounded-2xl border border-champagne/15 bg-ink-card p-6">
                <h3 className="flex items-center gap-2 font-serif text-lg text-ivory">
                  <Gift className="h-5 w-5 text-gold" /> Member Benefits
                </h3>
                <div className="mt-3 grid gap-2 text-sm text-ivory/70">
                  <p className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-champagne" /> Earn 1 loyalty point per ₹1,000 spent</p>
                  <p className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-champagne" /> 5 points = free night (up to ₹1,500)</p>
                  <p className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-champagne" /> Priority booking during festival season</p>
                  <p className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-champagne" /> Exclusive coupon codes via email</p>
                  <p className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-champagne" /> Festival calendar alerts (opt-in)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReviewsWidget({ limit = 3 }: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/reviews/public?limit=${limit}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => setReviews(j.reviews || []));
  }, [limit]);

  if (reviews.length === 0) return <p className="text-sm text-ivory/50">No reviews yet.</p>;

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="card-luxe p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-sm text-gold-foil">
                {r.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-ivory">{r.authorName}</p>
                <p className="text-[10px] text-ivory/40">{new Date(r.reviewDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-gold text-gold" : "fill-ivory/10 text-ivory/10")} />
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-ivory/70 line-clamp-2">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
