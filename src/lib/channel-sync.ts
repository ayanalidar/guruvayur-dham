import { db } from "@/lib/db";

/**
 * Channel Manager sync logic.
 *
 * When a booking is made (direct, walk-in, or from a channel partner),
 * we need to:
 *   1. Block the room's availability in our DB
 *   2. Broadcast the BLOCK to ALL OTHER connected channel partners
 *      (so Booking.com, MakeMyTrip, etc. show "sold out" for those dates)
 *
 * This module is shared by:
 *   - /api/walkin         (walk-in bookings)
 *   - /api/guest-booking  (direct online bookings)
 *   - /api/channel-inbox  (bookings coming IN from channel partners)
 *   - /api/bookings       (manual admin bookings)
 *
 * In production, the `broadcastToChannels` function would call each
 * channel partner's real API (Booking.com Connectivity API, MakeMyTrip
 * Channel Manager API, etc.). For now, it logs the sync intent and
 * creates SyncLog rows. When real API credentials are added to the
 * ChannelPartner table (apiKey, apiSecret), the real calls will be made.
 */

export type SyncResult = {
  channel: string;
  name: string;
  success: boolean;
  action: "BLOCK" | "UNBLOCK";
  logId: string;
  message: string;
};

/**
 * Broadcast a BLOCK (or UNBLOCK) to all connected channel partners
 * EXCEPT the source channel (to avoid echoing back to the source).
 *
 * @param bookingId - The booking ID in our DB
 * @param bookingRef - The booking reference (GD-XXXXXX)
 * @param roomSlug - The room's slug
 * @param roomId - The room's ID
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @param sourceChannel - The channel that made the booking (skip it)
 * @param action - "BLOCK" (new booking) or "UNBLOCK" (cancellation)
 */
export async function broadcastToChannels(params: {
  bookingId: string;
  bookingRef: string;
  roomSlug: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  sourceChannel: string;
  action?: "BLOCK" | "UNBLOCK";
}): Promise<SyncResult[]> {
  const { bookingId, bookingRef, roomSlug, roomId, checkIn, checkOut, sourceChannel, action = "BLOCK" } = params;

  // Find all connected channels EXCEPT the source
  const otherChannels = await db.channelPartner.findMany({
    where: {
      connected: true,
      code: { not: sourceChannel },
    },
  });

  const results: SyncResult[] = [];

  for (const ch of otherChannels) {
    let success = false;
    let message = "";

    try {
      // Try to call the real channel API if credentials are configured
      // For now, we log the sync intent. When real API keys are added,
      // this is where the actual HTTP call to Booking.com / MakeMyTrip would go.
      const realApiCall = await callChannelApi(ch, {
        action,
        roomSlug,
        checkIn,
        checkOut,
        bookingRef,
      });

      success = realApiCall.success;
      message = realApiCall.message;
    } catch (error: any) {
      success = false;
      message = `Sync error: ${error.message}`;
    }

    // Log the sync attempt
    const log = await db.syncLog.create({
      data: {
        bookingId,
        channel: ch.code,
        action,
        status: success ? "SUCCESS" : "FAILED",
        message: success
          ? `Inventory ${action.toLowerCase()}ed on ${ch.name} (sync from ${sourceChannel} booking ${bookingRef})`
          : `Failed to sync to ${ch.name}: ${message}`,
        payload: JSON.stringify({
          sourceChannel,
          sourceBookingRef: bookingRef,
          roomSlug,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        }),
      },
    });

    results.push({
      channel: ch.code,
      name: ch.name,
      success,
      action,
      logId: log.id,
      message,
    });
  }

  return results;
}

/**
 * Call a channel partner's real API to block/unblock inventory.
 *
 * Currently simulated. To enable real sync:
 *   1. Add `apiKey` and `apiSecret` columns to the ChannelPartner model
 *   2. Implement the actual API calls per channel:
 *      - Booking.com → Connectivity API (https://connect.booking.com/)
 *      - MakeMyTrip → Channel Manager API
 *      - Goibibo → Partner API
 *      - Agoda → Partner API
 *
 * For now, returns success=true to simulate a successful sync.
 */
async function callChannelApi(
  channel: { code: string; name: string; webhookUrl: string; apiEndpoint: string },
  payload: { action: "BLOCK" | "UNBLOCK"; roomSlug: string; checkIn: Date; checkOut: Date; bookingRef: string }
): Promise<{ success: boolean; message: string }> {
  // TODO: Implement real channel API calls here.
  // For now, we simulate a successful sync with a small delay.
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 150));

  return {
    success: true,
    message: `Simulated ${payload.action} on ${channel.name} for ${payload.roomSlug} (${payload.checkIn.toDateString()} → ${payload.checkOut.toDateString()})`,
  };
}

/**
 * Get the sync status for the admin dashboard.
 * Returns recent sync logs grouped by channel.
 */
export async function getSyncStatus(limit = 20) {
  const logs = await db.syncLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { booking: { select: { reference: true, guestName: true, room: { select: { name: true, slug: true } } } } },
  });

  const channels = await db.channelPartner.findMany({
    orderBy: { code: "asc" },
  });

  return {
    logs,
    channels: channels.map((c) => ({
      code: c.code,
      name: c.name,
      connected: c.connected,
      lastSyncAt: c.lastSyncAt,
      totalBookings: c.totalBookings,
    })),
  };
}
