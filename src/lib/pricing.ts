import { db } from "@/lib/db";

/**
 * Dynamic Pricing Engine
 * Calculates the price for a room on a given date, applying all active rules.
 * Rules with higher priority are applied first (multiply in order).
 */

export interface PricingBreakdown {
  basePrice: number;
  finalPrice: number;
  appliedRules: Array<{ name: string; type: string; multiplier: number; adjustment: number }>;
  totalAdjustment: number;
}

export async function calculateRoomPrice(
  roomSlug: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ perNightPrices: number[]; totalPrice: number; breakdown: PricingBreakdown[] }> {
  const room = await db.room.findUnique({ where: { slug: roomSlug } });
  if (!room) throw new Error("Room not found");

  const rules = await db.dynamicPricingRule.findMany({
    where: { active: true },
    orderBy: { priority: "desc" },
  });

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const perNightPrices: number[] = [];
  const breakdown: PricingBreakdown[] = [];

  for (let i = 0; i < nights; i++) {
    const date = new Date(checkIn);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();

    let price = room.price;
    const applied: PricingBreakdown["appliedRules"] = [];

    // Check availability table for priceOverride (manual override)
    const av = await db.availability.findUnique({
      where: { roomId_date: { roomId: room.id, date } },
    });
    if (av?.priceOverride) {
      const adj = av.priceOverride - price;
      applied.push({
        name: "Manual Override",
        type: "OVERRIDE",
        multiplier: av.priceOverride / room.price,
        adjustment: adj,
      });
      price = av.priceOverride;
    } else {
      // Apply rules
      for (const rule of rules) {
        let applies = false;

        if (rule.dayOfWeek) {
          const days = rule.dayOfWeek.split(",").map((d) => parseInt(d.trim()));
          if (days.includes(dayOfWeek)) applies = true;
        }

        if (rule.startDate && rule.endDate) {
          if (date >= rule.startDate && date <= rule.endDate) applies = true;
          else if (!rule.dayOfWeek) applies = false;
        }

        if (rule.type === "LAST_MINUTE") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 1) applies = true;
          else if (!rule.dayOfWeek && !rule.startDate) applies = false;
        }

        if (rule.type === "EARLY_BIRD") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diff >= 30) applies = true;
          else if (!rule.dayOfWeek && !rule.startDate) applies = false;
        }

        if (rule.roomType && rule.roomType !== room.type) applies = false;

        if (applies) {
          const before = price;
          price = Math.round(price * rule.multiplier);
          applied.push({
            name: rule.name,
            type: rule.type,
            multiplier: rule.multiplier,
            adjustment: price - before,
          });
        }
      }
    }

    // Don't let price go below 50% of base (sanity floor)
    if (price < room.price * 0.5) price = Math.round(room.price * 0.5);

    perNightPrices.push(price);
    breakdown.push({
      basePrice: room.price,
      finalPrice: price,
      appliedRules: applied,
      totalAdjustment: price - room.price,
    });
  }

  const totalPrice = perNightPrices.reduce((s, p) => s + p, 0);
  return { perNightPrices, totalPrice, breakdown };
}

/**
 * Coupon Validator
 */
export interface CouponResult {
  valid: boolean;
  message: string;
  discount: number;
  coupon?: { code: string; description: string; type: string; value: number };
}

export async function validateCoupon(code: string, bookingAmount: number): Promise<CouponResult> {
  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code", discount: 0 };
  }
  if (!coupon.active) {
    return { valid: false, message: "This coupon is no longer active", discount: 0 };
  }
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { valid: false, message: "Coupon has expired or not yet valid", discount: 0 };
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: "Coupon usage limit reached", discount: 0 };
  }
  if (bookingAmount < coupon.minBooking) {
    return {
      valid: false,
      message: `Minimum booking amount ₹${coupon.minBooking} required (your booking is ₹${bookingAmount})`,
      discount: 0,
    };
  }

  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = Math.round((bookingAmount * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === "FLAT") {
    discount = coupon.value;
  }

  return {
    valid: true,
    message: `Coupon applied — you save ₹${discount}`,
    discount,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
    },
  };
}

/**
 * Mark coupon as used (increment usedCount)
 */
export async function markCouponUsed(code: string) {
  await db.coupon.update({
    where: { code: code.toUpperCase() },
    data: { usedCount: { increment: 1 } },
  });
}

/**
 * Check if early-bird campaign is active for given dates
 */
export async function checkEarlyBirdCampaign(checkIn: Date): Promise<{ active: boolean; discountPercent: number; campaignName?: string }> {
  const today = new Date();
  const campaign = await db.earlyBirdCampaign.findFirst({
    where: {
      active: true,
      bookingWindowStart: { lte: today },
      bookingWindowEnd: { gte: today },
    },
  });
  if (!campaign) return { active: false, discountPercent: 0 };
  if (checkIn >= campaign.startDate && checkIn <= campaign.endDate) {
    return {
      active: true,
      discountPercent: campaign.discountPercent,
      campaignName: campaign.name,
    };
  }
  return { active: false, discountPercent: 0 };
}

/**
 * Estimate crowd level based on bookings + festival calendar
 */
export async function getCrowdForecast(date: Date): Promise<{ level: string; percentage: number; reason: string }> {
  const day = date.getDay();
  const isWeekend = day === 5 || day === 6 || day === 0;

  // Count bookings for that day
  const bookings = await db.booking.count({
    where: {
      checkIn: { lte: date },
      checkOut: { gt: date },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
  });

  const totalRooms = await db.room.aggregate({ _sum: { totalUnits: true } });
  const occupancyPct = totalRooms._sum.totalUnits
    ? Math.round((bookings / totalRooms._sum.totalUnits) * 100)
    : 0;

  // Check festival dates (simplified)
  const month = date.getMonth();
  const dom = date.getDate();
  let festival = "";
  if (month === 11 && dom === 8) festival = "Guruvayur Ekadasi";
  else if (month === 3 && dom === 14) festival = "Vishu";
  else if (month === 1 && dom >= 26 && dom <= 30) festival = "Utsavam";
  else if (month === 7 && dom === 25) festival = "Ashtami Rohini";

  if (festival) {
    return { level: "Very High", percentage: 95, reason: `${festival} festival` };
  }
  if (occupancyPct >= 80) return { level: "High", percentage: occupancyPct, reason: "High booking demand" };
  if (isWeekend) return { level: "Moderate-High", percentage: 65, reason: "Weekend" };
  if (occupancyPct >= 50) return { level: "Moderate", percentage: occupancyPct, reason: "Moderate bookings" };
  return { level: "Low", percentage: Math.max(occupancyPct, 20), reason: "Weekday, low demand" };
}
