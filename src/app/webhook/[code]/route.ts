import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /webhook/:code
 *
 * Email-to-booking webhook receiver.
 *
 * When an OTA booking email arrives at bookings@guruvayurdham.co.in,
 * the email service (Hostinger/Gmail/Mailgun) forwards it to this
 * webhook URL as a POST request.
 *
 * URL format: https://guruvayurdham.co.in/webhook/ram?key=SECRET
 *   - :code = "ram" (identifier, can be anything)
 *   - ?key= = secret token for authentication
 *
 * The webhook:
 *   1. Verifies the secret token
 *   2. Parses the email body (subject + text/html)
 *   3. Extracts booking details (guest name, dates, room type, phone)
 *   4. Creates a PENDING booking in the DB
 *   5. Returns 200 OK so the email service knows it was received
 *
 * Also accepts GET for health check (returns "OK" if webhook is live).
 */

// The secret token — must match what's configured in the email service
// settings. Stored as an env var or hardcoded for now.
// User configured: 5a16df3bca88cea8518c26e2a2c209491557c9127ff04d0b5c58052c5e87d3b5
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "5a16df3bca88cea8518c26e2a2c209491557c9127ff04d0b5c58052c5e87d3b5";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.pathname.split("/").pop();
  const key = req.nextUrl.searchParams.get("key");
  const authHeader = req.headers.get("authorization") || "";

  // Health check — return OK without auth (for testing if webhook is live)
  return NextResponse.json({
    ok: true,
    webhook: code,
    message: "Webhook is live. Send POST requests with email content.",
    authRequired: true,
    hint: "Include ?key=SECRET or Authorization: Bearer SECRET in POST requests.",
  });
}

export async function POST(req: NextRequest) {
  const code = req.nextUrl.pathname.split("/").pop();
  const contentType = req.headers.get("content-type") || "";

  // ===== AUTH =====
  // Check secret via ?key= param OR Authorization: Bearer header
  const queryKey = req.nextUrl.searchParams.get("key") || "";
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.replace("Bearer ", "");

  if (queryKey !== WEBHOOK_SECRET && bearerToken !== WEBHOOK_SECRET) {
    // Also check X-Webhook-Secret header (some email services use this)
    const headerSecret = req.headers.get("x-webhook-secret") || req.headers.get("x-api-key") || "";
    if (headerSecret !== WEBHOOK_SECRET) {
      console.error("[webhook] Auth failed for code:", code);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ===== PARSE EMAIL =====
  let emailData: any = {};

  try {
    if (contentType.includes("application/json")) {
      emailData = await req.json();
    } else if (contentType.includes("form-data") || contentType.includes("x-www-form-urlencoded")) {
      const formData = await req.formData();
      emailData = Object.fromEntries(formData.entries());
    } else {
      // Raw text (some email services send raw email body)
      const text = await req.text();
      emailData = { text, subject: "", from: "", to: "" };
    }
  } catch (e: any) {
    console.error("[webhook] Parse error:", e?.message);
    // Even if we can't parse, return 200 so the email service doesn't retry
    return NextResponse.json({ ok: true, message: "Received but could not parse email body" });
  }

  // Extract fields from various email webhook formats
  const subject = emailData.subject || emailData.Subject || emailData.emailSubject || "";
  const fromEmail = emailData.from || emailData.From || emailData.sender || emailData.email_from || "";
  const textBody = emailData.text || emailData.body || emailData.TextBody || emailData.content || emailData.plain || emailData["body-plain"] || "";
  const htmlBody = emailData.html || emailData.HTML || emailData.html_body || emailData["body-html"] || "";

  // Combine all text for parsing
  const fullText = `${subject}\n\n${textBody}\n\n${htmlBody}`.replace(/<[^>]*>/g, " "); // strip HTML tags

  // ===== EXTRACT BOOKING DETAILS =====
  // Try to extract booking info from the email text using regex patterns
  const extract = (patterns: string[]): string => {
    for (const p of patterns) {
      const match = fullText.match(new RegExp(p, "i"));
      if (match && match[1]) return match[1].trim();
    }
    return "";
  };

  // Guest name (various formats)
  const guestName = extract([
    "Guest Name[:\\s]+([A-Za-z\\s]+)",
    "Name[:\\s]+([A-Za-z\\s]+)",
    "Booking for[:\\s]+([A-Za-z\\s]+)",
    "Dear\\s+([A-Za-z\\s]+)",
  ]) || "OTA Guest";

  // Phone (Indian format)
  const guestPhone = extract([
    "Phone[:\\s]+([+\\d\\s-]+)",
    "Mobile[:\\s]+([+\\d\\s-]+)",
    "Contact[:\\s]+([+\\d\\s-]+)",
    "(\\+?91[\\d\\s-]{10,})",
    "(\\d{10})",
  ]) || "pending";

  // Check-in date (various formats)
  const checkInStr = extract([
    "Check-?in[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
    "Check-?in[:\\s]+([A-Za-z]+\\s+\\d{1,2})",
    "Arrival[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
    "From[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
  ]);

  // Check-out date
  const checkOutStr = extract([
    "Check-?out[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
    "Check-?out[:\\s]+([A-Za-z]+\\s+\\d{1,2})",
    "Departure[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
    "To[:\\s]+(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})",
  ]);

  // OTA booking ID
  const channelBookingId = extract([
    "Booking ID[:\\s]+([A-Z0-9-]+)",
    "Booking No[:\\s]+([A-Z0-9-]+)",
    "Confirmation[:\\s]+([A-Z0-9-]+)",
    "Ref[:\\s]+([A-Z0-9-]+)",
  ]);

  // Detect which OTA sent the email (from sender address or subject)
  let source = "DIRECT";
  const senderDomain = (fromEmail.match(/@([a-z.]+)/i) || [])[1]?.toLowerCase() || "";
  if (senderDomain.includes("booking.com") || subject.toLowerCase().includes("booking.com")) source = "BOOKING_COM";
  else if (senderDomain.includes("makemytrip") || subject.toLowerCase().includes("makemytrip") || subject.toLowerCase().includes("mmt")) source = "MAKEMYTRIP";
  else if (senderDomain.includes("goibibo") || subject.toLowerCase().includes("goibibo")) source = "GOIBIBO";
  else if (senderDomain.includes("agoda") || subject.toLowerCase().includes("agoda")) source = "AGODA";

  // ===== CREATE PENDING BOOKING =====
  try {
    // Parse dates (try DD/MM/YYYY, MM/DD/YYYY, etc.)
    const parseDate = (str: string): Date | null => {
      if (!str) return null;
      // Try DD/MM/YYYY or DD-MM-YYYY
      const m1 = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
      if (m1) {
        const d = parseInt(m1[1]);
        const m = parseInt(m1[2]);
        const y = parseInt(m1[3]) > 50 ? parseInt(m1[3]) : 2000 + parseInt(m1[3]);
        // Assume DD/MM (Indian format)
        const date = new Date(y, m - 1, d);
        if (!isNaN(date.getTime())) return date;
        // Try MM/DD (US format)
        const date2 = new Date(y, d - 1, m);
        if (!isNaN(date2.getTime())) return date2;
      }
      return null;
    };

    const checkInDate = parseDate(checkInStr);
    const checkOutDate = parseDate(checkOutStr);

    // If we can't parse dates, still create a booking with today's date
    // (staff will fix it in the admin panel)
    const finalCheckIn = checkInDate || new Date();
    const finalCheckOut = checkOutDate || new Date(Date.now() + 86400000); // +1 day

    // Check for duplicate (same channelBookingId + source)
    if (channelBookingId) {
      const existing = await db.booking.findFirst({
        where: { channelBookingId, source },
      });
      if (existing) {
        return NextResponse.json({ ok: true, message: "Duplicate booking — already imported", duplicate: true });
      }
    }

    // Find a room (use first room as fallback)
    const room = await db.room.findFirst({ where: { active: true } });
    if (!room) {
      return NextResponse.json({ ok: true, message: "No rooms in DB — booking not created" });
    }

    const nights = Math.round((finalCheckOut.getTime() - finalCheckIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    const ref = `WB-${Date.now().toString(36).toUpperCase()}`;
    await db.booking.create({
      data: {
        reference: ref,
        roomId: room.id,
        guestName: guestName.slice(0, 200),
        guestPhone: guestPhone.slice(0, 30),
        guestEmail: fromEmail.slice(0, 200) || null,
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        nights,
        guests: 2,
        amount: room.price * nights,
        status: "PENDING",
        source,
        channelBookingId: channelBookingId || null,
        notes: JSON.stringify({
          importedFrom: "email-webhook",
          webhookCode: code,
          emailSubject: subject,
          emailFrom: fromEmail,
          extractedGuestName: guestName,
          extractedPhone: guestPhone,
          extractedCheckIn: checkInStr,
          extractedCheckOut: checkOutStr,
          extractedBookingId: channelBookingId,
          autoImported: true,
          staffMustReview: true,
          rawEmailSnippet: textBody.slice(0, 500),
        }),
      },
    });

    console.log(`[webhook] Created PENDING booking ${ref} from ${source} email for ${guestName}`);

    return NextResponse.json({
      ok: true,
      message: `Booking imported as PENDING — review in /admin/bookings. Ref: ${ref}`,
      bookingRef: ref,
      guestName,
      source,
      extractedDates: { checkIn: checkInStr, checkOut: checkOutStr },
    });
  } catch (e: any) {
    console.error("[webhook] Booking creation failed:", e?.message);
    // Return 200 anyway so email service doesn't retry indefinitely
    return NextResponse.json({ ok: true, message: "Email received but booking creation failed — check server logs" });
  }
}
