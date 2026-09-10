import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateRoomPrice, validateCoupon, markCouponUsed, checkEarlyBirdCampaign, type CouponResult } from "@/lib/pricing";

/**
 * POST /api/guest-booking
 * Full guest booking flow:
 * 1. Validates availability
 * 2. Calculates dynamic price
 * 3. Applies coupon + early-bird discount
 * 4. Creates booking with source=DIRECT
 * 5. Simulates Razorpay payment
 * 6. Broadcasts BLOCK to all channels
 * 7. Creates CRM customer record
 * 8. Schedules reminders (check-in, darshan)
 * 9. Sends review request (scheduled for after checkout)
 *
 * body: {
 *   roomSlug, guestName, guestPhone, guestEmail,
 *   checkIn, checkOut, guests, couponCode?,
 *   darshanSlot?: "NIRMALYA" | "USHA" | "DEEPARADHANA",
 *   paymentMethod: "RAZORPAY" | "UPI" | "CARD" | "COD"
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    roomSlug, guestName, guestPhone, guestEmail,
    checkIn, checkOut, guests = 2, couponCode,
    darshanSlot, paymentMethod = "RAZORPAY",
  } = body;

  if (!roomSlug || !guestName || !guestPhone || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  ci.setHours(0, 0, 0, 0);
  co.setHours(0, 0, 0, 0);
  if (co <= ci) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });

  const nights = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));

  // ===== 1. CHECK AVAILABILITY =====
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    const av = await db.availability.findUnique({ where: { roomId_date: { roomId: room.id, date: d } } });
    if (!av || av.available <= 0) {
      // Auto-join waitlist
      const wl = await db.waitingList.create({
        data: {
          roomSlug, checkIn: ci, checkOut: co,
          guestName, guestPhone, guestEmail: guestEmail || null,
          guests,
        },
      });
      return NextResponse.json({
        error: "ROOM_SOLD_OUT",
        soldOutDate: d.toISOString(),
        waitlistId: wl.id,
        message: `Room not available on ${d.toLocaleDateString()}. You've been added to the waiting list · we'll WhatsApp you if it opens up.`,
      }, { status: 409 });
    }
  }

  // ===== 2. CALCULATE DYNAMIC PRICE =====
  const pricing = await calculateRoomPrice(roomSlug, ci, co);
  let finalAmount = pricing.totalPrice;

  // ===== 3. APPLY EARLY-BIRD DISCOUNT =====
  const earlyBird = await checkEarlyBirdCampaign(ci);
  let earlyBirdDiscount = 0;
  if (earlyBird.active) {
    earlyBirdDiscount = Math.round((finalAmount * earlyBird.discountPercent) / 100);
    finalAmount -= earlyBirdDiscount;
  }

  // ===== 4. APPLY COUPON =====
  let couponDiscount = 0;
  let couponResult: CouponResult | null = null;
  if (couponCode) {
    couponResult = await validateCoupon(couponCode, finalAmount);
    if (couponResult.valid) {
      couponDiscount = couponResult.discount;
      finalAmount -= couponDiscount;
    }
  }

  // ===== 5. CREATE BOOKING =====
  const ref = "GD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const booking = await db.booking.create({
    data: {
      reference: ref,
      roomId: room.id,
      guestName, guestPhone, guestEmail: guestEmail || null,
      checkIn: ci, checkOut: co,
      nights, guests,
      amount: finalAmount,
      source: "DIRECT",
      status: "CONFIRMED",
      notes: JSON.stringify({
        basePrice: pricing.totalPrice,
        earlyBird: { active: earlyBird.active, discount: earlyBirdDiscount, campaign: earlyBird.campaignName },
        coupon: couponResult?.valid ? { code: couponCode, discount: couponDiscount } : null,
        darshanSlot: darshanSlot || null,
        paymentMethod,
        paymentId: "pay_" + Math.random().toString(36).slice(2, 14),
        pricingBreakdown: pricing.breakdown.map(b => ({ date: "", base: b.basePrice, final: b.finalPrice, rules: b.appliedRules })),
      }),
    },
  });

  // ===== 6. MARK COUPON AS USED =====
  if (couponResult?.valid) {
    await markCouponUsed(couponCode);
  }

  // ===== 7. BLOCK AVAILABILITY =====
  for (let i = 0; i < nights; i++) {
    const d = new Date(ci);
    d.setDate(d.getDate() + i);
    await db.availability.update({
      where: { roomId_date: { roomId: room.id, date: d } },
      data: { available: { decrement: 1 }, lockedBy: ref },
    });
  }

  // ===== 8. BROADCAST TO ALL CHANNELS =====
  const channels = await db.channelPartner.findMany({ where: { connected: true } });
  for (const ch of channels) {
    await db.syncLog.create({
      data: {
        bookingId: booking.id,
        channel: ch.code,
        action: "BLOCK",
        status: "SUCCESS",
        message: `Direct website booking ${ref} · room ${room.name} blocked for ${guestName}`,
        payload: JSON.stringify({ reference: ref, roomSlug, checkIn: ci, checkOut: co, source: "DIRECT" }),
      },
    });
  }

  // ===== 9. CREATE/UPDATE CRM CUSTOMER =====
  await db.customer.upsert({
    where: { phone: guestPhone },
    create: {
      name: guestName, phone: guestPhone, email: guestEmail,
      totalBookings: 1, totalRevenue: finalAmount,
      loyaltyPoints: Math.floor(finalAmount / 1000),
      tags: "DIRECT_BOOKER",
    },
    update: {
      name: guestName, email: guestEmail,
      totalBookings: { increment: 1 },
      totalRevenue: { increment: finalAmount },
      loyaltyPoints: { increment: Math.floor(finalAmount / 1000) },
    },
  });

  // ===== 10. SCHEDULE REMINDERS =====
  // Check-in reminder (24h before)
  const checkInReminder = new Date(ci.getTime() - 24 * 60 * 60 * 1000);
  await db.reminder.create({
    data: {
      type: "CHECK_IN",
      bookingRef: ref,
      guestName, guestPhone,
      message: `Reminder: Your check-in at Guruvayur Dham is tomorrow at 12 PM. Reference: ${ref}. Room: ${room.name}. We look forward to welcoming you! 🙏`,
      scheduledFor: checkInReminder,
      channel: "WHATSAPP",
    },
  });

  // Darshan slot reminder (if specified)
  if (darshanSlot) {
    const slotTimes: any = {
      NIRMALYA: { time: "3:00 AM", desc: "Nirmalya Darshan (most sacred)" },
      USHA: { time: "8:30 AM", desc: "Usha Pooja Darshan" },
      DEEPARADHANA: { time: "6:15 PM", desc: "Deeparadhana (evening aarti)" },
    };
    const slot = slotTimes[darshanSlot];
    if (slot) {
      const darshanReminder = new Date(ci);
      darshanReminder.setHours(5, 0, 0, 0); // morning of check-in
      await db.reminder.create({
        data: {
          type: "DARSHAN",
          bookingRef: ref,
          guestName, guestPhone,
          message: `Your preferred darshan: ${slot.desc} at ${slot.time}. Walk to East Nada (2 min) · give yourself 30 min for queue. Reference: ${ref}`,
          scheduledFor: darshanReminder,
          channel: "WHATSAPP",
        },
      });
    }
  }

  // Review request (2h after checkout)
  const reviewTime = new Date(co.getTime() + 2 * 60 * 60 * 1000);
  await db.reviewRequest.create({
    data: {
      bookingRef: ref,
      guestName, guestPhone, guestEmail: guestEmail || null,
    },
  });
  await db.reminder.create({
    data: {
      type: "CHECK_OUT",
      bookingRef: ref,
      guestName, guestPhone,
      message: `[REVIEW_REQUEST] Send Google review link to ${guestName} for booking ${ref}`,
      scheduledFor: reviewTime,
      channel: "WHATSAPP",
    },
  });

  // ===== 11. SEND CONFIRMATION =====
  await db.notification.create({
    data: {
      type: "WHATSAPP",
      recipient: guestPhone,
      body: `🙏 Booking Confirmed!\n\nReference: ${ref}\nRoom: ${room.name}\nCheck-in: ${ci.toLocaleDateString("en-IN")}\nCheck-out: ${co.toLocaleDateString("en-IN")}\nNights: ${nights}\nGuests: ${guests}\nAmount: ₹${finalAmount}${couponResult?.valid ? `\nCoupon ${couponCode}: -₹${couponDiscount}` : ""}${earlyBird.active ? `\nEarly Bird (${earlyBird.campaignName}): -₹${earlyBirdDiscount}` : ""}\n\nPayment: ${paymentMethod} ✓\n\nSee you at Guruvayur Dham! Walk to East Nada in 2 min.`,
      status: "SENT",
      sentAt: new Date(),
      relatedRef: ref,
    },
  });

  // ====== BROADCAST REAL-TIME EVENT ======
  // Notify all connected admin dashboards about the new booking
  fetch(`${process.env.REALTIME_URL || "http://localhost:3003"}/broadcast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "booking:new",
      data: {
        reference: ref,
        guestName,
        roomName: room.name,
        roomSlug,
        checkIn: ci,
        checkOut: co,
        amount: finalAmount,
        source: "DIRECT",
        timestamp: new Date().toISOString(),
      },
    }),
  }).catch(() => {}); // silent fail if realtime service is down

  return NextResponse.json({
    booking: { ...booking, reference: ref },
    pricing: {
      baseTotal: pricing.breakdown.reduce((s, b) => s + b.basePrice, 0),
      dynamicTotal: pricing.totalPrice,
      earlyBird: { active: earlyBird.active, discount: earlyBirdDiscount, campaign: earlyBird.campaignName },
      coupon: couponResult?.valid ? { code: couponCode, discount: couponDiscount } : null,
      finalAmount,
      breakdown: pricing.breakdown,
    },
    payment: {
      method: paymentMethod,
      paymentId: "pay_" + Math.random().toString(36).slice(2, 14),
      status: "CAPTURED",
    },
    syncResults: {
      channelsSynced: channels.length,
    },
    reminders: {
      checkIn: true,
      darshan: !!darshanSlot,
      reviewRequest: true,
    },
    message: `Booking confirmed! Reference ${ref}. Amount ₹${finalAmount}. Synced to all ${channels.length} channels. Confirmation sent via WhatsApp.`,
  });
}
