"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Tag, CreditCard, Check, ChevronRight, ChevronLeft,
  Star, Sparkles, AlertCircle, Lock, ShieldCheck, Loader2,
} from "lucide-react";
import { ROOMS, formatINR, waLink } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Extend window for Razorpay
declare global {
  interface Window {
    Razorpay?: any;
  }
}

const STEPS = ["Dates & Room", "Guest Details", "Coupon & Payment", "Confirmation"];

const DARSHAN_SLOTS = [
  { value: "", label: "No preference" },
  { value: "NIRMALYA", label: "Nirmalya Darshan (3:00 AM)" },
  { value: "USHA", label: "Usha Pooja (8:30 AM)" },
  { value: "DEEPARADHANA", label: "Deeparadhana (6:15 PM)" },
];

const PAYMENT_METHODS = [
  { value: "RAZORPAY", label: "Razorpay (UPI/Card/Netbanking)", icon: "💳" },
  { value: "UPI", label: "Direct UPI", icon: "📱" },
  { value: "CARD", label: "Credit/Debit Card", icon: "💳" },
  { value: "COD", label: "Pay at Hotel", icon: "🏨" },
];

export default function GuestBookingPage() {
  const { navigate } = useHashRoute();
  const [step, setStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [darshanSlot, setDarshanSlot] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [booking, setBooking] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Fetch live availability
  useEffect(() => {
    fetch("/api/availability?days=1", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        const map: Record<string, number> = {};
        for (const a of j.availability || []) map[a.roomSlug] = a.days?.[0]?.available ?? 0;
        setAvailability(map);
      });
  }, []);

  // Fetch pricing when room/dates change
  const [pricing, setPricing] = useState<any>(null);
  const [couponResult, setCouponResult] = useState<any>(null);
  useEffect(() => {
    if (!selectedRoom || !checkIn || !checkOut) return;
    let active = true;
    fetch(`/api/pricing?roomSlug=${selectedRoom}&checkIn=${checkIn}&checkOut=${checkOut}`)
      .then(r => r.json())
      .then(j => { if (active) { setPricing(j); setCouponResult(null); } });
    return () => { active = false; };
  }, [selectedRoom, checkIn, checkOut]);

  const validateCoupon = async () => {
    if (!couponCode || !pricing) return;
    const r = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, bookingAmount: pricing.finalTotal }),
    });
    const j = await r.json();
    setCouponResult(j);
    if (j.valid) toast.success(j.message);
    else toast.error(j.message);
  };

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay checkout.js script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) { setRazorpayLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const submit = async () => {
    setCreating(true);

    // If Razorpay selected, open the checkout modal
    if (paymentMethod === "RAZORPAY" && razorpayLoaded && pricing) {
      try {
        const finalAmount = pricing.finalTotal - (couponResult?.discount || 0);
        // 1. Create order on server
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalAmount * 100, // convert to paise
            receipt: `GD-${Date.now()}`,
            notes: { roomSlug: selectedRoom, guestName, checkIn, checkOut },
          }),
        });
        const order = await orderRes.json();
        if (!order.orderId) {
          toast.error("Failed to create payment order");
          setCreating(false);
          return;
        }

        // 2. Open Razorpay checkout
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Guruvayur Dham",
          description: `${ROOMS.find(r => r.slug === selectedRoom)?.name} · ${pricing.nights} night(s)`,
          image: "/icon-192.png",
          order_id: order.orderId,
          prefill: {
            name: guestName,
            contact: guestPhone,
            email: guestEmail || undefined,
          },
          theme: { color: "#D4C4A8" },
          handler: async (response: any) => {
            // 3. Verify payment on server
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verify = await verifyRes.json();
            if (!verify.verified) {
              toast.error("Payment verification failed. Please contact us.");
              setCreating(false);
              return;
            }
            // 4. Create the booking with verified payment
            await createBooking(verify.paymentId);
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled. Your booking was not created.");
              setCreating(false);
            },
          },
        });
        rzp.on("payment.failed", (resp: any) => {
          toast.error(`Payment failed: ${resp.error?.description || "Unknown error"}`);
          setCreating(false);
        });
        rzp.open();
      } catch (e) {
        toast.error("Payment initialization failed");
        setCreating(false);
      }
      return;
    }

    // Non-Razorpay methods (UPI, CARD, COD) — direct booking
    await createBooking();
  };

  const createBooking = async (paymentId?: string) => {
    try {
      const r = await fetch("/api/guest-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: selectedRoom,
          guestName, guestPhone, guestEmail,
          checkIn, checkOut, guests,
          couponCode: couponResult?.valid ? couponCode : undefined,
          darshanSlot: darshanSlot || undefined,
          paymentMethod,
          paymentId,
        }),
      });
      const j = await r.json();
      if (j.error) {
        toast.error(j.error);
        if (j.error === "ROOM_SOLD_OUT") {
          toast.info(j.message);
        }
      } else {
        setBooking(j);
        setStep(3);
        toast.success(`Booking confirmed! Reference: ${j.booking.reference}`);
      }
    } catch {
      toast.error("Booking failed. Please try again.");
    }
    setCreating(false);
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Book Your Stay"
        icon={Calendar}
        title={<>Instant <GoldFoilText>Booking</GoldFoilText></>}
        subtitle="Real-time availability, dynamic pricing, instant confirmation. No booking fee."
        crumbs={[{ label: "Home", route: "/" }, { label: "Book Now" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x max-w-4xl">
          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold transition-all",
                  i === step ? "border-champagne bg-champagne text-ink" : i < step ? "border-green-500 bg-green-500/15 text-green-300" : "border-champagne/20 text-ivory/40"
                )}>
                  {i < step ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <span className={cn("ml-2 hidden text-xs font-semibold sm:block", i === step ? "text-champagne" : "text-ivory/40")}>{s}</span>
                {i < STEPS.length - 1 && <div className={cn("mx-3 h-px w-8 sm:w-16", i < step ? "bg-green-500/50" : "bg-champagne/20")} />}
              </div>
            ))}
          </div>

          <div className="card-luxe p-6 sm:p-8">
            {/* Step 1: Dates & Room */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl text-ivory">Pick Your Dates & Room</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Check-in</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Check-out</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Guests</label>
                    <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} guest{n>1?"s":""}</option>)}
                    </select>
                  </div>
                </div>

                <h3 className="mt-8 font-serif text-lg text-ivory">Select Room</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {ROOMS.map((r) => {
                    const av = availability[r.slug];
                    const soldOut = av === 0;
                    const selected = selectedRoom === r.slug;
                    return (
                      <button
                        key={r.slug}
                        onClick={() => !soldOut && setSelectedRoom(r.slug)}
                        disabled={soldOut}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                          selected ? "border-champagne bg-champagne/10" : soldOut ? "border-red-500/20 opacity-50" : "border-champagne/10 hover:border-champagne/30"
                        )}
                      >
                        <img src={r.image} alt={r.name} className="h-16 w-20 flex-shrink-0 rounded-lg object-cover photo-cinematic" />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-ivory">{r.name}</p>
                          <p className="text-xs text-ivory/50">{r.capacity} guests · {r.bedType}</p>
                          <p className="text-sm font-semibold text-gold-foil">{formatINR(r.price)}<span className="text-xs text-ivory/40">/night</span></p>
                        </div>
                        {av !== undefined && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", soldOut ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300")}>
                            {soldOut ? "SOLD OUT" : `${av} left`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Pricing preview */}
                {pricing && (
                  <div className="mt-6 rounded-xl border border-champagne/15 bg-ink/50 p-4">
                    <p className="font-serif text-lg text-ivory">Price Breakdown</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="flex justify-between text-ivory/70"><span>Base ({pricing.nights} nights)</span><span>₹{pricing.baseTotal.toLocaleString("en-IN")}</span></p>
                      {pricing.dynamicTotal !== pricing.baseTotal && <p className="flex justify-between text-ivory/70"><span>Dynamic pricing adjustment</span><span className={pricing.dynamicTotal > pricing.baseTotal ? "text-red-300" : "text-green-300"}>{pricing.dynamicTotal > pricing.baseTotal ? "+" : ""}₹{(pricing.dynamicTotal - pricing.baseTotal).toLocaleString("en-IN")}</span></p>}
                      {pricing.earlyBird.active && <p className="flex justify-between text-green-300"><span>Early Bird ({pricing.earlyBird.campaignName})</span><span>-₹{pricing.earlyBird.discount.toLocaleString("en-IN")}</span></p>}
                      <p className="flex justify-between border-t border-champagne/10 pt-2 font-serif text-lg text-gold-foil"><span>Total</span><span>₹{pricing.finalTotal.toLocaleString("en-IN")}</span></p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button onClick={() => setStep(1)} disabled={!selectedRoom || !checkIn || !checkOut} className="btn-luxe disabled:opacity-40">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Guest Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl text-ivory">Guest Details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Full Name *</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Rajesh Menon" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Phone / WhatsApp *</label>
                    <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Email</label>
                    <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="rajesh@example.com" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-wider text-ivory/50">Preferred Darshan Slot (free reminder)</label>
                  <select value={darshanSlot} onChange={(e) => setDarshanSlot(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none">
                    {DARSHAN_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(0)} className="btn-ghost-luxe"><ChevronLeft className="h-4 w-4" /> Back</button>
                  <button onClick={() => setStep(2)} disabled={!guestName || !guestPhone} className="btn-luxe disabled:opacity-40">Continue <ChevronRight className="h-4 w-4" /></button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Coupon & Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl text-ivory">Coupon & Payment</h2>

                {/* Coupon */}
                <div className="mt-4 rounded-xl border border-champagne/15 bg-ink/50 p-4">
                  <label className="text-[10px] uppercase tracking-wider text-ivory/50 flex items-center gap-1"><Tag className="h-3 w-3" /> Coupon Code</label>
                  <div className="mt-2 flex gap-2">
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="EARLYBIRD10" className="flex-1 rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                    <button onClick={validateCoupon} disabled={!couponCode} className="rounded-lg bg-champagne px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40">Apply</button>
                  </div>
                  {couponResult?.valid && <p className="mt-2 text-xs text-green-300">✓ {couponResult.message}</p>}
                  {couponResult && !couponResult.valid && <p className="mt-2 text-xs text-red-300">✗ {couponResult.message}</p>}
                  <p className="mt-2 text-[10px] text-ivory/40">Try: EARLYBIRD10, EKADASI2026, RETURN15, WEEKDAY5</p>
                </div>

                {/* Payment method */}
                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-wider text-ivory/50">Payment Method</label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {PAYMENT_METHODS.map(p => (
                      <button key={p.value} onClick={() => setPaymentMethod(p.value)} className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition-all", paymentMethod === p.value ? "border-champagne bg-champagne/10" : "border-champagne/10 hover:border-champagne/30")}>
                        <span className="text-2xl">{p.icon}</span>
                        <span className="text-sm text-ivory">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Final total */}
                {pricing && (
                  <div className="mt-6 rounded-xl border border-champagne/15 bg-ink/50 p-4">
                    <p className="font-serif text-lg text-ivory">Final Amount</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="flex justify-between text-ivory/70"><span>Dynamic total ({pricing.nights} nights)</span><span>₹{pricing.dynamicTotal.toLocaleString("en-IN")}</span></p>
                      {pricing.earlyBird.active && <p className="flex justify-between text-green-300"><span>Early Bird (-{pricing.earlyBird.discountPercent}%)</span><span>-₹{pricing.earlyBird.discount.toLocaleString("en-IN")}</span></p>}
                      {couponResult?.valid && <p className="flex justify-between text-green-300"><span>Coupon ({couponCode})</span><span>-₹{couponResult.discount.toLocaleString("en-IN")}</span></p>}
                      <p className="flex justify-between border-t border-champagne/10 pt-2 font-serif text-2xl text-gold-foil">
                        <span>Pay Now</span>
                        <span>₹{(pricing.finalTotal - (couponResult?.discount || 0)).toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-ivory/50">
                  <Lock className="h-3 w-3" /> Secure payment via Razorpay. Your card details never touch our server.
                  {paymentMethod === "RAZORPAY" && !razorpayLoaded && (
                    <span className="ml-2 inline-flex items-center gap-1 text-champagne"><Loader2 className="h-3 w-3 animate-spin" /> Loading checkout…</span>
                  )}
                  {paymentMethod === "RAZORPAY" && razorpayLoaded && (
                    <span className="ml-2 inline-flex items-center gap-1 text-green-300"><ShieldCheck className="h-3 w-3" /> Ready</span>
                  )}
                </div>

                <div className="mt-2 rounded-lg border border-champagne/10 bg-ink/30 p-2 text-[10px] text-ivory/40">
                  ⚠️ Demo mode: No real payment will be charged. Add <code className="text-champagne">RAZORPAY_KEY_ID</code> and <code className="text-champagne">RAZORPAY_KEY_SECRET</code> to <code className="text-champagne">.env</code> for live payments.
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-ghost-luxe"><ChevronLeft className="h-4 w-4" /> Back</button>
                  <button onClick={submit} disabled={creating || (paymentMethod === "RAZORPAY" && !razorpayLoaded)} className="btn-luxe disabled:opacity-40">
                    {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><CreditCard className="h-4 w-4" /> {paymentMethod === "COD" ? "Confirm Booking" : "Pay & Confirm"}</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 3 && booking && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-green-500/30 bg-green-500/15">
                  <Check className="h-10 w-10 text-green-300" />
                </div>
                <h2 className="mt-4 font-serif text-3xl text-ivory">Booking Confirmed!</h2>
                <p className="mt-1 text-sm text-ivory/60">A confirmation has been sent to your WhatsApp.</p>

                <div className="mx-auto mt-6 max-w-md rounded-xl border border-champagne/15 bg-ink/50 p-5 text-left">
                  <p className="text-xs uppercase tracking-wider text-ivory/50">Booking Reference</p>
                  <p className="font-mono text-2xl text-gold-foil">{booking.booking.reference}</p>
                  <div className="mt-3 space-y-1 text-sm text-ivory/70">
                    <p className="flex justify-between"><span>Room</span><span className="text-ivory">{ROOMS.find(r => r.slug === selectedRoom)?.name}</span></p>
                    <p className="flex justify-between"><span>Check-in</span><span className="text-ivory">{new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></p>
                    <p className="flex justify-between"><span>Check-out</span><span className="text-ivory">{new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></p>
                    <p className="flex justify-between"><span>Guests</span><span className="text-ivory">{guests}</span></p>
                    <p className="flex justify-between"><span>Amount Paid</span><span className="text-gold-foil">₹{booking.pricing.finalAmount.toLocaleString("en-IN")}</span></p>
                    <p className="flex justify-between"><span>Payment</span><span className="text-green-300">{paymentMethod} ✓</span></p>
                  </div>
                  <div className="mt-3 rounded-lg bg-green-500/10 p-2 text-xs text-green-300">
                    ✓ Synced to all {booking.syncResults.channelsSynced} channel partners (Booking.com, MakeMyTrip, Goibibo, Agoda)
                  </div>
                  {booking.reminders.darshan && <div className="mt-2 rounded-lg bg-champagne/10 p-2 text-xs text-champagne">🔔 Darshan reminder scheduled for your check-in day</div>}
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <MagneticButton onClick={() => navigate("/rooms")}>View Rooms</MagneticButton>
                  <MagneticButton variant="ghost" href={waLink(`Namaskaram! I just booked ${booking.booking.reference}. I have a question.`)}>WhatsApp Us</MagneticButton>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
