"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Users, Tag, CreditCard, Check, ChevronRight, ChevronLeft,
  Star, Sparkles, AlertCircle, Lock, ShieldCheck, Loader2,
  Minus, Plus, X,
} from "lucide-react";
import { ROOMS, formatINR, waLink, type Room } from "@/lib/site-data";
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
  { value: "NIRMALYA", label: "Mangala Aarti darshan (3:00 AM)" },
  { value: "USHA", label: "Usha Pooja (8:30 AM)" },
  { value: "DEEPARADHANA", label: "Deeparadhana (6:15 PM)" },
];

const PAYMENT_METHODS = [
  { value: "RAZORPAY", label: "Razorpay (UPI/Card/Netbanking)", icon: "💳" },
  { value: "UPI", label: "Direct UPI", icon: "📱" },
  { value: "CARD", label: "Credit/Debit Card", icon: "💳" },
  { value: "COD", label: "Pay at Hotel", icon: "🏨" },
];

// Max guests per booking - increased from 6 to 8 per business rule
const MAX_GUESTS = 8;

type RoomSelection = { slug: string; quantity: number };

export default function GuestBookingPage() {
  const { navigate } = useHashRoute();
  const [step, setStep] = useState(0);
  // Multi-room selection state: array of {slug, quantity}
  // (was: `selectedRoom: string` which only allowed one room per booking)
  const [selectedRooms, setSelectedRooms] = useState<RoomSelection[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  // Total guests is auto-suggested from sum(room.capacity × quantity)
  // but the customer can still override it up to MAX_GUESTS=8.
  const [guestOverride, setGuestOverride] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  // Invoice-specific fields (optional - for B2B guests who want GST invoice)
  const [guestGSTIN, setGuestGSTIN] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [showInvoiceFields, setShowInvoiceFields] = useState(false);
  const [darshanSlot, setDarshanSlot] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [bookings, setBookings] = useState<any[]>([]); // multiple room bookings
  const [creating, setCreating] = useState(false);
  // Snapshot of the rooms selected at submit time (used in Confirmation step
  // because selectedRooms is wiped after submit)
  const [bookedRoomsSnapshot, setBookedRoomsSnapshot] = useState<RoomSelection[]>([]);

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

  // ===== Multi-room helpers =====
  const getRoomQuantity = (slug: string) =>
    selectedRooms.find(s => s.slug === slug)?.quantity || 0;

  const setRoomQuantity = (slug: string, qty: number) => {
    setSelectedRooms(prev => {
      const without = prev.filter(s => s.slug !== slug);
      if (qty <= 0) return without;
      return [...without, { slug, quantity: qty }];
    });
  };

  // Live total guests = sum(room.capacity × quantity)
  const computedGuests = useMemo(() => {
    return selectedRooms.reduce((sum, s) => {
      const room = ROOMS.find(r => r.slug === s.slug);
      return sum + (room?.capacity || 0) * s.quantity;
    }, 0);
  }, [selectedRooms]);

  // Sync guests state with computedGuests unless user is overriding
  useEffect(() => {
    if (!guestOverride && computedGuests > 0) {
      setGuests(Math.min(computedGuests, MAX_GUESTS));
    } else if (!guestOverride) {
      // No rooms selected - default to 2
      setGuests(2);
    }
  }, [computedGuests, guestOverride]);

  const totalSelectedRooms = selectedRooms.reduce((n, s) => n + s.quantity, 0);
  const hasSelection = totalSelectedRooms > 0;

  // Fetch pricing for each selected room when rooms/dates change
  const [pricingMap, setPricingMap] = useState<Record<string, any>>({});
  const [couponResult, setCouponResult] = useState<any>(null);

  useEffect(() => {
    if (!hasSelection || !checkIn || !checkOut) {
      setPricingMap({});
      return;
    }
    let active = true;
    Promise.all(
      selectedRooms.map(async s => {
        const r = await fetch(`/api/pricing?roomSlug=${s.slug}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const j = await r.json();
        return [s.slug, j];
      })
    ).then(results => {
      if (!active) return;
      const map: Record<string, any> = {};
      for (const [slug, j] of results as any) map[slug] = j;
      setPricingMap(map);
      setCouponResult(null);
    });
    return () => { active = false; };
  }, [selectedRooms, checkIn, checkOut, hasSelection]);

  // Aggregate pricing across all selected rooms
  const aggregatePricing = useMemo(() => {
    if (!hasSelection) return null;
    let baseTotal = 0;
    let dynamicTotal = 0;
    let earlyBirdDiscount = 0;
    let earlyBirdActive = false;
    let earlyBirdCampaign = "";
    let nights = 0;
    for (const s of selectedRooms) {
      const p = pricingMap[s.slug];
      if (!p) continue;
      baseTotal += (p.baseTotal || 0) * s.quantity;
      dynamicTotal += (p.dynamicTotal || 0) * s.quantity;
      earlyBirdDiscount += (p.earlyBird?.discount || 0) * s.quantity;
      if (p.earlyBird?.active) {
        earlyBirdActive = true;
        earlyBirdCampaign = p.earlyBird.campaignName;
      }
      nights = p.nights || 0;
    }
    const finalTotal = dynamicTotal - earlyBirdDiscount;
    return {
      baseTotal,
      dynamicTotal,
      earlyBird: {
        active: earlyBirdActive,
        discount: earlyBirdDiscount,
        campaignName: earlyBirdCampaign,
        discountPercent: earlyBirdActive && dynamicTotal > 0 ? Math.round((earlyBirdDiscount * 100) / dynamicTotal) : 0,
      },
      nights,
      finalTotal,
    };
  }, [selectedRooms, pricingMap, hasSelection]);

  const validateCoupon = async () => {
    if (!couponCode || !aggregatePricing) return;
    const r = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, bookingAmount: aggregatePricing.finalTotal }),
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

    // Calculate final amount across all rooms + coupon
    const couponDiscount = couponResult?.valid ? couponResult.discount : 0;
    const finalAmount = (aggregatePricing?.finalTotal || 0) - couponDiscount;

    // If Razorpay selected, open the checkout modal
    if (paymentMethod === "RAZORPAY" && razorpayLoaded && aggregatePricing) {
      try {
        // 1. Create order on server
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalAmount * 100, // convert to paise
            receipt: `GD-${Date.now()}`,
            notes: {
              rooms: selectedRooms.map(s => `${s.slug}x${s.quantity}`).join(","),
              guestName, checkIn, checkOut,
            },
          }),
        });
        const order = await orderRes.json();
        if (!order.orderId) {
          toast.error("Failed to create payment order");
          setCreating(false);
          return;
        }

        // Check if demo mode - skip Razorpay modal, go straight to booking
        if (order.demo) {
          toast.info("Demo mode: Payment simulated. Add Razorpay keys for real payments.");
          await createBookings("pay_demo_" + Math.random().toString(36).slice(2, 14));
          return;
        }

        // 2. Open Razorpay checkout (real mode only)
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Guruvayur Dham",
          description: `${totalSelectedRooms} room(s) · ${aggregatePricing.nights} night(s)`,
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
            // 4. Create all the bookings with the verified payment
            await createBookings(verify.paymentId);
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
      } catch {
        toast.error("Payment initialization failed");
        setCreating(false);
      }
      return;
    }

    // Non-Razorpay methods (UPI, CARD, COD) · direct booking
    await createBookings();
  };

  // ===== MULTI-ROOM BOOKING CREATION =====
  // Loops through selectedRooms, creating one Booking per (room × quantity)
  // under the same guest + parentReference for grouping in the admin.
  const createBookings = async (paymentId?: string) => {
    if (!aggregatePricing) {
      toast.error("Pricing not yet calculated. Please wait a moment and try again.");
      setCreating(false);
      return;
    }
    // Snapshot rooms before submit so the Confirmation step can show them
    // even after we wipe the selection state.
    setBookedRoomsSnapshot([...selectedRooms]);

    const parentRef = `GD-${Date.now().toString(36).toUpperCase()}`;
    const couponDiscount = couponResult?.valid ? couponResult.discount : 0;
    const couponCodeFinal = couponResult?.valid ? couponCode : undefined;
    const totalFinalAmount = aggregatePricing.finalTotal - couponDiscount;

    // Per-room proportion of coupon discount (proportional by room finalTotal)
    const totalRoomFinal = aggregatePricing.finalTotal;

    const newBookings: any[] = [];
    let successCount = 0;
    let firstError: string | null = null;

    for (const sel of selectedRooms) {
      const room = ROOMS.find(r => r.slug === sel.slug);
      if (!room) continue;
      const pricing = pricingMap[sel.slug];
      if (!pricing) continue;

      // Each unit of the room is a separate booking row (so each gets its
      // own booking reference, availability decrement, channel sync, etc.)
      for (let unit = 0; unit < sel.quantity; unit++) {
        // Proportion of coupon for this unit
        const unitRoomFinal = pricing.finalTotal;
        const unitCouponDiscount =
          couponDiscount > 0 && totalRoomFinal > 0
            ? Math.round((couponDiscount * unitRoomFinal) / totalRoomFinal)
            : 0;
        const unitFinal = unitRoomFinal - unitCouponDiscount;

        try {
          const r = await fetch("/api/guest-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomSlug: sel.slug,
              guestName, guestPhone, guestEmail,
              guestGSTIN: guestGSTIN || undefined,
              guestAddress: guestAddress || undefined,
              arrivalTime: arrivalTime || undefined,
              departureTime: departureTime || undefined,
              checkIn, checkOut,
              guests: Math.min(guests, room.capacity),
              couponCode: couponCodeFinal,
              darshanSlot: darshanSlot || undefined,
              paymentMethod,
              paymentId,
              parentReference: parentRef, // groups all bookings of same reservation
              isMultiRoom: totalSelectedRooms > 1,
            }),
          });
          const j = await r.json();
          if (j.error) {
            if (!firstError) firstError = j.message || j.error;
            // If a room is sold out mid-loop, stop and report - remaining
            // rooms in this reservation are not booked (caller can see
            // the partial success in the confirmation step).
            break;
          } else {
            newBookings.push(j);
            successCount++;
          }
        } catch {
          if (!firstError) firstError = "Network error - some rooms may not have been booked. Please contact us.";
          break;
        }
      }
      if (firstError) break; // break out of outer loop too
    }

    setBookings(newBookings);

    if (successCount === 0) {
      toast.error(firstError || "Booking failed. Please try again.");
    } else if (firstError) {
      toast.warning(`Partially booked: ${successCount} of ${totalSelectedRooms} rooms confirmed. ${firstError}`);
      setStep(3);
    } else {
      setStep(3);
      toast.success(`All ${successCount} room booking(s) confirmed! Refs: ${newBookings.map(b => b.booking.reference).join(", ")}`);
    }

    // Clear selection after successful submit (keep snapshot for confirmation)
    if (successCount > 0) {
      setSelectedRooms([]);
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
            {/* Step 1: Dates & Multi-Room Selection */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl text-ivory">Pick Dates & Select Rooms</h2>
                <p className="mt-1 text-xs text-ivory/50">
                  Book multiple rooms for your group · quantity steppers below each room · max {MAX_GUESTS} guests per booking.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Check-in</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                    <p className="mt-1 text-[10px] text-champagne/70">Check-in from 11:30 AM</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Check-out</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
                    <p className="mt-1 text-[10px] text-champagne/70">Check-out by 11:00 AM</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50 flex items-center justify-between">
                      <span>Total Guests</span>
                      {guestOverride && (
                        <button
                          type="button"
                          onClick={() => setGuestOverride(false)}
                          className="text-[9px] text-champagne underline"
                        >
                          Auto-calc from rooms
                        </button>
                      )}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => {
                        setGuests(parseInt(e.target.value));
                        setGuestOverride(true);
                      }}
                      className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                    >
                      {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-ivory/40">
                      {guestOverride
                        ? "Manually set"
                        : hasSelection
                        ? `Auto from ${totalSelectedRooms} room(s) · max capacity ${computedGuests}`
                        : "Select rooms below to auto-calc"}
                    </p>
                  </div>
                </div>

                <h3 className="mt-8 font-serif text-lg text-ivory flex items-center gap-2">
                  Select Rooms
                  {totalSelectedRooms > 0 && (
                    <span className="rounded-full border border-champagne/30 bg-champagne/10 px-2 py-0.5 text-[10px] font-semibold text-champagne">
                      {totalSelectedRooms} selected
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-xs text-ivory/50">
                  Use the + / - buttons on each room to add multiple rooms · book 2 Deluxe rooms for a group of 4-6, or a Suite + Deluxe combo for the family.
                </p>

                {/* Multi-room selection grid - each card has its own quantity stepper */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {ROOMS.map((r) => {
                    const av = availability[r.slug];
                    const soldOut = av === 0;
                    const qty = getRoomQuantity(r.slug);
                    // Use gallery[0] if image is empty - more reliable for DB-backed rooms
                    const displayImg = r.gallery?.[0] || r.image;
                    return (
                      <div
                        key={r.slug}
                        className={cn(
                          "flex flex-col rounded-xl border p-3 transition-all",
                          qty > 0
                            ? "border-champagne bg-champagne/10"
                            : soldOut
                            ? "border-red-500/20 opacity-50"
                            : "border-champagne/10 hover:border-champagne/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Display image - use gallery[0] for accuracy */}
                          <img
                            src={displayImg}
                            alt={`${r.name} at Guruvayur Dham · ${r.shortDesc}`}
                            className="h-16 w-20 flex-shrink-0 rounded-lg object-cover photo-cinematic"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-sm text-ivory">{r.name}</p>
                            <p className="text-xs text-ivory/50">{r.capacity} guests · {r.bedType}</p>
                            <p className="text-sm font-semibold text-gold-foil">
                              {formatINR(r.price)}
                              <span className="text-xs text-ivory/40">/night</span>
                            </p>
                          </div>
                          {av !== undefined && (
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", soldOut ? "bg-red-500/15 text-red-300" : "bg-green-500/15 text-green-300")}>
                              {soldOut ? "SOLD OUT" : `${av} left`}
                            </span>
                          )}
                        </div>
                        {/* Quantity stepper - only show if not sold out */}
                        {!soldOut && (
                          <div className="mt-2 flex items-center justify-between border-t border-champagne/10 pt-2">
                            <span className="text-[10px] uppercase tracking-wider text-ivory/50">
                              Rooms of this type
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setRoomQuantity(r.slug, Math.max(0, qty - 1))}
                                disabled={qty === 0}
                                className="grid h-7 w-7 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:bg-champagne/10 disabled:opacity-30"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center font-semibold text-ivory">{qty}</span>
                              <button
                                type="button"
                                onClick={() => setRoomQuantity(r.slug, Math.min(qty + 1, Math.min(av || 1, 5)))}
                                disabled={av !== undefined && qty >= av}
                                className="grid h-7 w-7 place-items-center rounded-full border border-champagne/20 bg-champagne text-ink transition-colors hover:bg-champagne-bright disabled:opacity-30"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Aggregate pricing preview across all selected rooms */}
                {aggregatePricing && (
                  <div className="mt-6 rounded-xl border border-champagne/15 bg-ink/50 p-4">
                    <p className="font-serif text-lg text-ivory">Price Breakdown ({aggregatePricing.nights} night(s))</p>
                    <div className="mt-2 space-y-2 text-sm">
                      {/* Per-room line items */}
                      {selectedRooms.map(s => {
                        const r = ROOMS.find(room => room.slug === s.slug);
                        const p = pricingMap[s.slug];
                        if (!r || !p) return null;
                        return (
                          <p key={s.slug} className="flex justify-between text-ivory/70">
                            <span>{r.name} × {s.quantity}</span>
                            <span>₹{((p.dynamicTotal || p.baseTotal || 0) * s.quantity).toLocaleString("en-IN")}</span>
                          </p>
                        );
                      })}
                      {aggregatePricing.earlyBird.active && (
                        <p className="flex justify-between text-green-300">
                          <span>Early Bird ({aggregatePricing.earlyBird.campaignName})</span>
                          <span>-₹{aggregatePricing.earlyBird.discount.toLocaleString("en-IN")}</span>
                        </p>
                      )}
                      <p className="flex justify-between border-t border-champagne/10 pt-2 font-serif text-lg text-gold-foil">
                        <span>Total</span>
                        <span>₹{aggregatePricing.finalTotal.toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(1)}
                    disabled={!hasSelection || !checkIn || !checkOut}
                    className="btn-luxe disabled:opacity-40"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Guest Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-serif text-2xl text-ivory">Guest Details</h2>
                {/* Summary chip - shows what rooms were booked */}
                <div className="mt-2 rounded-xl border border-champagne/15 bg-ink-card/50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-champagne">Your Reservation</p>
                  <div className="mt-1 space-y-0.5 text-xs text-ivory/80">
                    {selectedRooms.map(s => {
                      const r = ROOMS.find(room => room.slug === s.slug);
                      if (!r) return null;
                      return (
                        <div key={s.slug} className="flex justify-between">
                          <span>{r.name}</span>
                          <span>× {s.quantity}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between border-t border-champagne/10 pt-1 mt-1 text-champagne">
                      <span>Total guests</span>
                      <span>{guests}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-ivory/50">Full Name *</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Rajesh Sharma" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
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

                {/* Optional GST invoice fields - collapsible, for B2B guests */}
                <div className="mt-4 rounded-xl border border-champagne/15 bg-ink-card/50 p-4">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceFields(v => !v)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-champagne">
                      Need a GST invoice? (optional)
                    </span>
                    <ChevronRight className={`h-3 w-3 text-champagne transition-transform ${showInvoiceFields ? "rotate-90" : ""}`} />
                  </button>
                  {showInvoiceFields && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your GSTIN</label>
                        <input
                          value={guestGSTIN}
                          onChange={(e) => setGuestGSTIN(e.target.value.toUpperCase())}
                          placeholder="09ABCDE1234F1Z5"
                          maxLength={15}
                          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Billing Address</label>
                        <input
                          value={guestAddress}
                          onChange={(e) => setGuestAddress(e.target.value)}
                          placeholder="City, State"
                          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Arrival Time</label>
                        <input
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          placeholder="11:30 am"
                          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-ivory/50">Departure Time</label>
                        <input
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          placeholder="11:00 am"
                          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none"
                        />
                      </div>
                      <p className="col-span-2 text-[10px] text-ivory/40">
                        These appear on your tax invoice. Leave blank if not applicable.
                      </p>
                    </div>
                  )}
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
                {aggregatePricing && (
                  <div className="mt-6 rounded-xl border border-champagne/15 bg-ink/50 p-4">
                    <p className="font-serif text-lg text-ivory">Final Amount ({totalSelectedRooms} room(s) · {aggregatePricing.nights} night(s))</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="flex justify-between text-ivory/70"><span>Dynamic total</span><span>₹{aggregatePricing.dynamicTotal.toLocaleString("en-IN")}</span></p>
                      {aggregatePricing.earlyBird.active && <p className="flex justify-between text-green-300"><span>Early Bird (-{aggregatePricing.earlyBird.discountPercent}%)</span><span>-₹{aggregatePricing.earlyBird.discount.toLocaleString("en-IN")}</span></p>}
                      {couponResult?.valid && <p className="flex justify-between text-green-300"><span>Coupon ({couponCode})</span><span>-₹{couponResult.discount.toLocaleString("en-IN")}</span></p>}
                      <p className="flex justify-between border-t border-champagne/10 pt-2 font-serif text-2xl text-gold-foil">
                        <span>Pay Now</span>
                        <span>₹{(aggregatePricing.finalTotal - (couponResult?.discount || 0)).toLocaleString("en-IN")}</span>
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

            {/* Step 4: Confirmation (multi-room) */}
            {step === 3 && bookings.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-green-500/30 bg-green-500/15">
                  <Check className="h-10 w-10 text-green-300" />
                </div>
                <h2 className="mt-4 font-serif text-3xl text-ivory">
                  {bookings.length > 1
                    ? `${bookings.length} Bookings Confirmed!`
                    : "Booking Confirmed!"}
                </h2>
                <p className="mt-1 text-sm text-ivory/60">A confirmation has been sent to your WhatsApp.</p>

                <div className="mx-auto mt-6 max-w-md rounded-xl border border-champagne/15 bg-ink/50 p-5 text-left">
                  <p className="text-xs uppercase tracking-wider text-ivory/50">Booking References</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {bookings.map((b, i) => (
                      <span key={i} className="font-mono text-sm text-gold-foil bg-champagne/5 rounded px-2 py-1">
                        {b.booking.reference}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-ivory/70">
                    {/* List all booked rooms */}
                    {bookedRoomsSnapshot.map((s, i) => {
                      const r = ROOMS.find(room => room.slug === s.slug);
                      if (!r) return null;
                      return (
                        <p key={i} className="flex justify-between">
                          <span>{r.name}</span>
                          <span className="text-ivory">× {s.quantity}</span>
                        </p>
                      );
                    })}
                    <p className="flex justify-between border-t border-champagne/10 pt-2"><span>Check-in</span><span className="text-ivory">{new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · 11:30 AM</span></p>
                    <p className="flex justify-between"><span>Check-out</span><span className="text-ivory">{new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · 11:00 AM</span></p>
                    <p className="flex justify-between"><span>Guests</span><span className="text-ivory">{guests}</span></p>
                    <p className="flex justify-between"><span>Amount Paid</span><span className="text-gold-foil">₹{bookings.reduce((sum, b) => sum + (b.pricing?.finalAmount || 0), 0).toLocaleString("en-IN")}</span></p>
                    <p className="flex justify-between"><span>Payment</span><span className="text-green-300">{paymentMethod} ✓</span></p>
                  </div>
                  {bookings[0]?.syncResults && (
                    <div className="mt-3 rounded-lg bg-green-500/10 p-2 text-xs text-green-300">
                      ✓ Synced to all {bookings[0].syncResults.channelsSynced} channel partners (Booking.com, MakeMyTrip, Goibibo, Agoda)
                    </div>
                  )}
                  {bookings[0]?.reminders?.darshan && (
                    <div className="mt-2 rounded-lg bg-champagne/10 p-2 text-xs text-champagne">🔔 Darshan reminder scheduled for your check-in day</div>
                  )}
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <MagneticButton onClick={() => navigate("/rooms")}>View Rooms</MagneticButton>
                  <MagneticButton variant="ghost" href={waLink(`Namaskaram! I just booked ${bookings.map(b => b.booking.reference).join(", ")}. I have a question.`)}>WhatsApp Us</MagneticButton>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
