"use client";

/**
 * Client-side data fetching helpers.
 * All fetches go to /api/* routes which talk to Prisma.
 */

export interface RoomData {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  capacity: number;
  size: string;
  bedType: string;
  image: string;
  gallery: string[];
  badge: string | null;
  description: string;
  shortDesc: string;
  amenities: string[];
  totalUnits: number;
  active: boolean;
  rates: Array<{ channelPartner: string; priceModifier: number; active: boolean }>;
}

export interface ContentMap {
  [key: string]: string;
}

/** Fetch all content blocks as a key→value map. */
export async function fetchContent(): Promise<ContentMap> {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    if (!r.ok) return {};
    const j = await r.json();
    return j.map || {};
  } catch {
    return {};
  }
}

/** Fetch all rooms (with rate plans). */
export async function fetchRooms(): Promise<RoomData[]> {
  try {
    const r = await fetch("/api/rooms", { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return j.rooms || [];
  } catch {
    return [];
  }
}

/** Fetch a single room by slug. */
export async function fetchRoom(slug: string): Promise<RoomData | null> {
  try {
    const r = await fetch(`/api/rooms?slug=${slug}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.room || null;
  } catch {
    return null;
  }
}

/** Fetch availability for a room (next N days). */
export async function fetchAvailability(roomSlug: string, days = 30) {
  try {
    const r = await fetch(`/api/availability?roomSlug=${roomSlug}&days=${days}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return j.availability;
  } catch {
    return null;
  }
}

/** Create a booking (broadcasts to all channels). */
export async function createBooking(data: {
  roomSlug: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  source?: string;
  channelBookingId?: string;
  notes?: string;
}) {
  const r = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

/** Create a walk-in booking (broadcasts to all channels). */
export async function createWalkIn(data: {
  roomSlug: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  notes?: string;
}) {
  const r = await fetch("/api/walkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

/** Simulate a channel partner sending us a booking. */
export async function simulateChannelBooking(data: {
  channelCode: string;
  channelBookingId: string;
  roomSlug: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
}) {
  const r = await fetch("/api/channel-inbox", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

/** Fetch dashboard stats. */
export async function fetchStats() {
  try {
    const r = await fetch("/api/stats", { cache: "no-store" });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

/** Fetch all bookings. */
export async function fetchBookings(filters?: { status?: string; source?: string }) {
  const q = new URLSearchParams();
  if (filters?.status) q.set("status", filters.status);
  if (filters?.source) q.set("source", filters.source);
  try {
    const r = await fetch(`/api/bookings?${q}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return j.bookings || [];
  } catch {
    return [];
  }
}

/** Fetch sync logs. */
export async function fetchSyncLogs(channel?: string, limit = 50) {
  const q = new URLSearchParams();
  if (channel) q.set("channel", channel);
  q.set("limit", String(limit));
  try {
    const r = await fetch(`/api/channel-sync?${q}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return j.logs || [];
  } catch {
    return [];
  }
}

/** Fetch channel partners. */
export async function fetchChannelPartners() {
  try {
    const r = await fetch("/api/channel-partners", { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return j.partners || [];
  } catch {
    return [];
  }
}

/** Update a content block. */
export async function updateContent(updates: Array<{ key: string; value: string }>) {
  const r = await fetch("/api/content", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  return r.json();
}

/** Update a room. */
export async function updateRoom(id: string, data: Partial<RoomData>) {
  const r = await fetch("/api/rooms", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, data }),
  });
  return r.json();
}
