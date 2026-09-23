import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildInvoiceData } from "@/lib/invoice";
import { generateInvoicePdf } from "@/lib/invoice-pdf";

/**
 * GET /api/invoice/pdf?bookingId=xxx
 *
 * Returns the invoice PDF as binary (Content-Type: application/pdf).
 *
 * SECURITY (IDOR protection):
 *   - Staff (any role) can view any booking's invoice.
 *   - Guests can view only their own bookings — matched by phone OR email.
 *
 * Query params:
 *   - bookingId (required) — the booking ID
 *   - download=1 (optional) — forces "Content-Disposition: attachment" (download)
 *                              otherwise "inline" (preview in browser)
 *   - token (optional) — one-time token for guest link from email (TODO if needed)
 *
 * For test/dev: ?demo=1 returns a sample invoice without auth or booking.
 *   Useful for verifying PDF generation works in production.
 */
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");
  const isDownload = req.nextUrl.searchParams.get("download") === "1";
  const isDemo = req.nextUrl.searchParams.get("demo") === "1";

  // Demo mode — returns a sample invoice without auth or booking ID.
  // Lets the admin verify PDF generation works end-to-end via /admin/system button.
  if (isDemo) {
    try {
      const { SITE } = await import("@/lib/site-data");
      const { formatINR, formatDateIndian } = await import("@/lib/invoice");
      const demoData = {
        invoiceNumber: "SAMPLE",
        invoiceDate: formatDateIndian(new Date()),
        dueDate: formatDateIndian(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
        fromName: SITE.name,
        fromAddress: SITE.address,
        fromPhones: SITE.phones,
        fromEmail: SITE.email,
        fromGSTIN: SITE.gstin,
        toName: "AMIT JAISWAL (SHRIRAM FINANCE LTD)",
        toAddress: "PRAYAGRAJ UP",
        toPhone: "7881105252",
        toEmail: "guest@example.com",
        toGSTIN: "09AAACS7018R1ZR",
        roomName: "Suite",
        arrivalDate: "21 Sept 2026",
        arrivalTime: "08:32 pm",
        departureDate: "23 Sept 2026",
        departureTime: "09:30 am",
        nights: 2,
        items: [
          {
            srNo: 1,
            description: "Suite — Room Charges",
            rate: `2 × ${formatINR(2800)}`,
            amount: formatINR(5600),
          },
        ],
        subtotal: formatINR(5600),
        taxableAmount: formatINR(5600),
        cgstRate: 2.5,
        sgstRate: 2.5,
        igstRate: 0,
        cgstAmount: formatINR(140),
        sgstAmount: formatINR(140),
        igstAmount: formatINR(0),
        grandTotal: formatINR(5880),
        paymentMethod: "UPI",
        bank: SITE.bank,
        terms: [
          "Subjected to Mathura jurisdiction only.",
          "Goods once sold will not be taken back.",
          "Interest @ 24% p.a. will be charged if bill not paid within 15 days.",
        ],
        footerCredit: "Powered By: GUARDIANX",
        logoPath: "/public/logo-invoice.png",
      };
      const pdf = await generateInvoicePdf(demoData as any);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="invoice-sample.pdf"`,
          "Cache-Control": "private, max-age=60",
        },
      });
    } catch (e: any) {
      console.error("Demo invoice generation failed:", e);
      return NextResponse.json(
        { error: "PDF generation failed", message: e?.message || String(e) },
        { status: 500 },
      );
    }
  }

  // Production path — require bookingId
  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId required (or use ?demo=1 for a sample invoice)" },
      { status: 400 },
    );
  }

  // Authorization — staff OR booking owner
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { guestPhone: true, guestEmail: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isStaff = session.role !== "GUEST";
  if (!isStaff) {
    // Guest — must own this booking (match by phone or email)
    const guestPhone = session.user.phone || "";
    const guestEmail = session.user.email || "";
    const owns = booking.guestPhone === guestPhone
      || (booking.guestEmail && booking.guestEmail === guestEmail);
    if (!owns) {
      return NextResponse.json({ error: "Forbidden — not your booking" }, { status: 403 });
    }
  }

  try {
    const data = await buildInvoiceData(bookingId);
    if (!data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const pdf = await generateInvoicePdf(data);

    // Cache the generated PDF in the Invoice row so subsequent downloads are instant.
    // (We don't cache here on first request to avoid blocking the response — but
    // the buildInvoiceData function already auto-creates the Invoice row with the
    // sequential number. The pdfBase64 field can be populated by a background job
    // later if needed.)

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="invoice-${data.invoiceNumber}.pdf"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (e: any) {
    console.error("Invoice PDF generation failed:", e);
    return NextResponse.json(
      { error: "PDF generation failed", message: e?.message || String(e) },
      { status: 500 },
    );
  }
}
