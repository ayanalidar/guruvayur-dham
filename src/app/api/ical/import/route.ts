import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/ical/import
 *
 * Fetches all configured OTA iCal feeds, parses them, and creates
 * Booking records for any booked dates found.
 *
 * This is called by a Vercel cron job every 10 minutes (configurable
 * via ICAL_SYNC_ENABLED setting).
 *
 * OTA iCal feeds are configured via /admin/settings → INTEGRATION:
 *   ICAL_BOOKING_COM_URL = https://admin.booking.com/...
 *   ICAL_AGODA_URL       = https://www.agoda.com/...
 *   ICAL_AIRBNB_URL      = https://www.airbnb.com/...
 *   ICAL_EXPEDIA_URL     = https://www.expedia.com/...
 *
 * The iCal feed from OTAs contains VEVENT blocks with:
 *   DTSTART = check-in date
 *   DTEND   = check-out date
 *   SUMMARY = guest name or room description
 *   UID     = OTA booking ID (used for dedup)
 *
 * Flow:
 *   1. For each OTA, fetch the iCal feed from the configured URL
 *   2. Parse VEVENT blocks → extract dates + UID
 *   3. For each event, check if a booking with the same reference already exists
 *   4. If not, create a PENDING booking (staff must review + confirm)
 *   5. If yes, skip (dedup)
 *
 * AUTH: Can be called by:
 *   - Vercel cron (with CRON_SECRET header)
 *   - Staff (with session cookie)
 */

// Map OTA source key → channel source name
const OTA_CONFIG: Array<{
  settingKey: string;
  source: string;
  label: string;
}> = [
  { settingKey: "ICAL_BOOKING_COM_URL", source: "BOOKING_COM", label: "Booking.com" },
  { settingKey: "ICAL_AGODA_URL", source: "AGODA", label: "Agoda" },
  { settingKey: "ICAL_AIRBNB_URL", source: "WALKIN", label: "Airbnb" }, // Airbnb maps to WALKIN (no dedicated source)
  { settingKey: "ICAL_EXPEDIA_URL", source: "WALKIN", label: "Expedia" }, // Expedia maps to WALKIN
];

/**
 * GET /api/ical/import
 * Same as POST but for external cron services (cron-job.org) that send GET.
 * Calls the import logic with no body (use canonical defaults).
 */
export async function GET(req: NextRequest) {
  // Reuse the POST logic by calling it with an empty body
  return POST(new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({}),
  }));
}

export async function POST(req: NextRequest) {
  // Auth: either staff OR cron secret (multiple methods for compat)
  const expectedCronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get("x-cron-secret") || "";
  const bearerToken = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const queryKey = req.nextUrl.searchParams.get("key") || "";
  const isCron = expectedCronSecret && (
    headerSecret === expectedCronSecret ||
    bearerToken === expectedCronSecret ||
    queryKey === expectedCronSecret
  );

  if (!isCron) {
    const { error } = await requireStaff(req);
    if (error) return error;
  }

  // Check if iCal sync is enabled
  const syncEnabled = await getSetting("ICAL_SYNC_ENABLED");
  if (syncEnabled === "false" || syncEnabled === "0") {
    return NextResponse.json({ ok: true, message: "iCal sync disabled", imported: 0 });
  }

  const results: Array<{ ota: string; status: string; imported: number; skipped: number; error?: string }> = [];
  let totalImported = 0;
  let totalSkipped = 0;

  for (const ota of OTA_CONFIG) {
    const icalUrl = await getSetting(ota.settingKey);
    if (!icalUrl) {
      results.push({ ota: ota.label, status: "not_configured", imported: 0, skipped: 0 });
      continue;
    }

    try {
      // Fetch the iCal feed
      const response = await fetch(icalUrl, { cache: "no-store" });
      if (!response.ok) {
        results.push({ ota: ota.label, status: "fetch_failed", imported: 0, skipped: 0, error: `HTTP ${response.status}` });
        continue;
      }
      const icalText = await response.text();

      // Parse VEVENT blocks
      const events = parseICalEvents(icalText);
      let imported = 0;
      let skipped = 0;

      for (const event of events) {
        // Dedup: check if a booking with this OTA reference already exists
        // The UID from the iCal feed is used as the channelBookingId
        const channelBookingId = event.uid;
        if (!channelBookingId) {
          skipped++;
          continue;
        }

        // Check for existing booking with same channelBookingId + source
        const existing = await db.booking.findFirst({
          where: {
            channelBookingId,
            source: ota.source,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Parse dates from the event
        const checkInDate = parseICalDate(event.dtStart);
        const checkOutDate = parseICalDate(event.dtEnd);

        if (!checkInDate || !checkOutDate) {
          skipped++;
          continue;
        }

        // Calculate nights
        const nights = Math.round(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (nights <= 0) {
          skipped++;
          continue;
        }

        // Try to match room type from the summary
        // OTA summaries often contain the room name, e.g. "King Deluxe Room"
        const roomSlug = matchRoomType(event.summary || "");

        // Find the room
        let room = roomSlug
          ? await db.room.findUnique({ where: { slug: roomSlug } })
          : null;

        // If no room match, use the first room as fallback
        if (!room) {
          room = await db.room.findFirst({ where: { active: true } });
        }

        if (!room) {
          skipped++;
          continue;
        }

        // Create a PENDING booking (staff must confirm)
        const ref = `IC-${Date.now().toString(36).toUpperCase()}-${imported}`;
        await db.booking.create({
          data: {
            reference: ref,
            roomId: room.id,
            guestName: event.summary?.replace(/^.*?-\s*/, "").trim() || "OTA Guest",
            guestPhone: "pending",
            guestEmail: null,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            guests: 2,
            amount: room.price * nights,
            status: "PENDING",
            source: ota.source,
            channelBookingId,
            notes: JSON.stringify({
              importedFrom: ota.label,
              icalUID: event.uid,
              icalSummary: event.summary,
              autoImported: true,
              staffMustReview: true,
            }),
          },
        });

        imported++;
      }

      totalImported += imported;
      totalSkipped += skipped;
      results.push({
        ota: ota.label,
        status: imported > 0 ? "imported" : "no_new",
        imported,
        skipped,
      });
    } catch (e: any) {
      results.push({
        ota: ota.label,
        status: "error",
        imported: 0,
        skipped: 0,
        error: e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    totalImported,
    totalSkipped,
    results,
    message: totalImported > 0
      ? `Imported ${totalImported} new OTA booking(s). Review in /admin/bookings.`
      : "No new OTA bookings found.",
  });
}

/**
 * Parse iCal VEVENT blocks from the raw iCal text.
 */
function parseICalEvents(icalText: string): Array<{
  uid: string;
  dtStart: string;
  dtEnd: string;
  summary: string;
}> {
  const events: Array<{ uid: string; dtStart: string; dtEnd: string; summary: string }> = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(icalText)) !== null) {
    const eventBlock = match[1];
    const uid = eventBlock.match(/UID:(.+)/)?.[1]?.trim();
    const dtStart = eventBlock.match(/DTSTART[^:]*:(.+)/)?.[1]?.trim();
    const dtEnd = eventBlock.match(/DTEND[^:]*:(.+)/)?.[1]?.trim();
    const summary = eventBlock.match(/SUMMARY:(.+)/)?.[1]?.trim();

    if (uid && dtStart && dtEnd) {
      events.push({ uid, dtStart, dtEnd, summary: summary || "" });
    }
  }

  return events;
}

/**
 * Parse an iCal date string into a JS Date.
 * Handles both YYYYMMDD (all-day) and YYYYMMDDTHHMMSSZ (timed) formats.
 */
function parseICalDate(dateStr: string): Date | null {
  // All-day format: 20261115
  if (/^\d{8}$/.test(dateStr)) {
    const y = parseInt(dateStr.slice(0, 4));
    const m = parseInt(dateStr.slice(4, 6)) - 1;
    const d = parseInt(dateStr.slice(6, 8));
    return new Date(y, m, d);
  }
  // Timed format: 20261115T120000Z
  if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    const y = parseInt(dateStr.slice(0, 4));
    const m = parseInt(dateStr.slice(4, 6)) - 1;
    const d = parseInt(dateStr.slice(6, 8));
    return new Date(y, m, d);
  }
  return null;
}

/**
 * Match OTA room description to our room slug.
 * OTA names often differ from our internal names, so we do fuzzy matching.
 */
function matchRoomType(summary: string): string | null {
  const s = summary.toLowerCase();

  // Direct keyword matching
  const mappings: Array<{ keywords: string[]; slug: string }> = [
    { keywords: ["king deluxe", "king bed", "king room"], slug: "super-deluxe-room" },
    { keywords: ["premium double", "double bed", "premium room"], slug: "superior-room" },
    { keywords: ["family comfort", "triple", "family triple"], slug: "family-comfort-triple-room" },
    { keywords: ["family suit", "quad", "family quad", "suit room"], slug: "deluxe-room" },
    { keywords: ["privilege suite", "suite", "gvd suite", "premium suite"], slug: "gvd-suite" },
    { keywords: ["deluxe room", "deluxe"], slug: "super-deluxe-room" },
  ];

  for (const m of mappings) {
    if (m.keywords.some(kw => s.includes(kw))) {
      return m.slug;
    }
  }

  return null;
}
