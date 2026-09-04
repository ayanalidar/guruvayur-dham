import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/invoice?bookingId=xxx — get invoice data for a booking
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  // Build invoice data — every field is editable in the admin invoice generator
  const invoice = {
    invoiceNumber: `INV-${booking.reference}`,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(booking.checkIn).toISOString().slice(0, 10),
    // From
    fromName: "Guruvayur Dham",
    fromAddress: "East Nada Road, Near Guruvayur Temple, Guruvayur, Kerala 680101",
    fromPhone: "+91 98765 43210",
    fromEmail: "stay@guruvayurdham.com",
    fromGST: "32ABCDE1234F1Z5",
    // To
    toName: booking.guestName,
    toAddress: "",
    toPhone: booking.guestPhone,
    toEmail: booking.guestEmail || "",
    toGST: "",
    // Items
    items: [
      {
        description: `${booking.room.name} — ${booking.nights} night(s)`,
        hsn: "996331",
        qty: booking.nights,
        rate: Math.round(booking.amount / booking.nights),
        amount: booking.amount,
      },
    ],
    subtotal: booking.amount,
    cgstRate: 6,
    sgstRate: 6,
    cgst: Math.round(booking.amount * 0.06),
    sgst: Math.round(booking.amount * 0.06),
    total: Math.round(booking.amount * 1.12),
    notes: "Thank you for choosing Guruvayur Dham. All amounts in INR.",
    terms: "Payment due on check-out. Cancellation as per booking policy.",
  };

  return NextResponse.json({ invoice, booking });
}

// PATCH /api/invoice — save edited invoice (returns the updated invoice for PDF generation)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  // In production, this would save to an Invoice table.
  // For now, just echo back the edited invoice for PDF generation.
  return NextResponse.json({ invoice: body, saved: true });
}
