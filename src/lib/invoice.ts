/**
 * Invoice data helpers — pulls booking + room + CMS-stored invoice data.
 *
 * CMS-editable blocks (all in `invoice` category):
 *   invoice.hotelName, invoice.gstin, invoice.address, invoice.phones,
 *   invoice.email, invoice.bank.name, invoice.bank.accountNumber,
 *   invoice.bank.ifsc, invoice.bank.branch, invoice.terms, invoice.footerCredit,
 *   invoice.logoPath
 *
 * GST rates are in the Setting table (editable via Admin → Settings → Integration):
 *   GST_CGST_RATE, GST_SGST_RATE, GST_IGST_RATE
 * If GST_IGST_RATE > 0, only IGST is shown on the invoice (inter-state).
 * Otherwise CGST + SGST are shown (intra-state).
 *
 * Falls back to SITE constants when CMS is empty (so the invoice works
 * even before /api/seed is run).
 */

import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { SITE } from "@/lib/site-data";

export interface InvoiceData {
  // Invoice metadata
  invoiceNumber: string;     // e.g. "635" (sequential)
  invoiceDate: string;      // e.g. "23 Sept 2026"
  dueDate: string;          // same as checkIn formatted

  // From (hotel)
  fromName: string;
  fromAddress: string;
  fromPhones: string;
  fromEmail: string;
  fromGSTIN: string;

  // To (guest)
  toName: string;
  toAddress: string;
  toPhone: string;
  toEmail: string;
  toGSTIN: string;

  // Stay
  roomName: string;
  arrivalDate: string;      // formatted "21 Sept 2026"
  arrivalTime: string;      // e.g. "08:32 pm"
  departureDate: string;
  departureTime: string;
  nights: number;

  // Items
  items: Array<{
    srNo: number;
    description: string;
    rate: string;            // "2 × ₹2,800.00"
    amount: string;         // "₹5,600.00"
  }>;

  // Totals
  subtotal: string;
  taxableAmount: string;
  cgstRate: number;         // 0 if inter-state
  sgstRate: number;
  igstRate: number;         // 0 if intra-state
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  grandTotal: string;

  // Payment + bank
  paymentMethod: string;
  bank: {
    name: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };

  // Misc
  terms: string[];          // numbered terms
  footerCredit: string;
  logoPath: string;
}

/**
 * Format a number as Indian Rupee currency.
 * 5600 → "₹5,600.00"
 * 140 → "₹140.00"
 * 5880 → "₹5,880.00"
 */
export function formatINR(amount: number): string {
  // Indian numbering system uses lakh/crore separators (e.g. 1,00,000).
  // en-IN locale handles this natively.
  return "₹" + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a Date as "21 Sept 2026" (Indian style).
 */
export function formatDateIndian(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get GST rates from settings (with fallback to SITE.defaultGstRates).
 * Returns the 3 rates + a flag indicating inter-state vs intra-state.
 */
export async function getGstRates(): Promise<{
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
}> {
  const cgstStr = await getSetting("GST_CGST_RATE");
  const sgstStr = await getSetting("GST_SGST_RATE");
  const igstStr = await getSetting("GST_IGST_RATE");

  // Empty strings (admin hasn't set values) → fall back to SITE defaults.
  const cgst = cgstStr ? parseFloat(cgstStr) : SITE.defaultGstRates.cgst;
  const sgst = sgstStr ? parseFloat(sgstStr) : SITE.defaultGstRates.sgst;
  const igst = igstStr ? parseFloat(igstStr) : SITE.defaultGstRates.igst;

  // Inter-state supply: IGST > 0 takes precedence; CGST + SGST are not shown.
  return { cgst, sgst, igst, isInterState: igst > 0 };
}

/**
 * Get a CMS block value with fallback.
 */
async function getCMS(key: string, fallback: string): Promise<string> {
  const v = await getSetting(key);
  return v || fallback;
}

/**
 * Build the complete invoice data object from a booking ID.
 * Reads from:
 *   - Booking (Prisma)
 *   - Room (Prisma, via booking.room)
 *   - Invoice (Prisma, for sequential number — auto-created if missing)
 *   - CMS content blocks (hotel name, GSTIN, address, bank, terms, etc.)
 *   - GST settings (CGST/SGST/IGST rates)
 */
export async function buildInvoiceData(bookingId: string): Promise<InvoiceData | null> {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { room: true, invoice: true },
  });
  if (!booking) return null;

  // Ensure an Invoice row exists (auto-creates with sequential number).
  let invoice = booking.invoice;
  if (!invoice) {
    invoice = await db.invoice.create({
      data: {
        bookingId: booking.id,
        // number auto-increments via Prisma default
      },
    });
  }

  // Read all CMS blocks (with fallback to SITE constants)
  const fromName = await getCMS("invoice.hotelName", SITE.name);
  const fromGSTIN = await getCMS("invoice.gstin", SITE.gstin);
  const fromAddress = await getCMS("invoice.address", SITE.address);
  const fromPhones = await getCMS("invoice.phones", SITE.phones);
  const fromEmail = await getCMS("invoice.email", SITE.email);

  const bankName = await getCMS("invoice.bank.name", SITE.bank.name);
  const bankAccountNumber = await getCMS("invoice.bank.accountNumber", SITE.bank.accountNumber);
  const bankIfsc = await getCMS("invoice.bank.ifsc", SITE.bank.ifsc);
  const bankBranch = await getCMS("invoice.bank.branch", SITE.bank.branch);

  const termsRaw = await getCMS("invoice.terms", "");
  const terms = termsRaw.split(/\n+/).map(t => t.trim()).filter(Boolean);

  const footerCredit = await getCMS("invoice.footerCredit", "Powered By: GUARDIANX");
  const logoPath = await getCMS("invoice.logoPath", "/public/logo-large.png");

  // GST rates
  const rates = await getGstRates();

  // Per-night rate
  const perNightRate = booking.nights > 0 ? Math.round(booking.amount / booking.nights) : booking.amount;

  // Tax calculations
  const subtotal = booking.amount;
  const taxableAmount = subtotal; // no discount

  let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
  if (rates.isInterState) {
    igstAmount = Math.round(subtotal * rates.igst / 100);
  } else {
    cgstAmount = Math.round(subtotal * rates.cgst / 100);
    sgstAmount = Math.round(subtotal * rates.sgst / 100);
  }
  const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount;

  return {
    invoiceNumber: String(invoice.number),
    invoiceDate: formatDateIndian(new Date()),
    dueDate: formatDateIndian(booking.checkIn),

    fromName,
    fromAddress,
    fromPhones,
    fromEmail,
    fromGSTIN,

    toName: booking.guestName,
    toAddress: booking.guestAddress || "",
    toPhone: booking.guestPhone,
    toEmail: booking.guestEmail || "",
    toGSTIN: booking.guestGSTIN || "",

    roomName: booking.room.name,
    arrivalDate: formatDateIndian(booking.checkIn),
    arrivalTime: booking.arrivalTime || "",
    departureDate: formatDateIndian(booking.checkOut),
    departureTime: booking.departureTime || "",
    nights: booking.nights,

    items: [
      {
        srNo: 1,
        description: `${booking.room.name} — Room Charges`,
        rate: `${booking.nights} × ${formatINR(perNightRate)}`,
        amount: formatINR(booking.amount),
      },
    ],

    subtotal: formatINR(subtotal),
    taxableAmount: formatINR(taxableAmount),

    cgstRate: rates.cgst,
    sgstRate: rates.sgst,
    igstRate: rates.igst,
    cgstAmount: formatINR(cgstAmount),
    sgstAmount: formatINR(sgstAmount),
    igstAmount: formatINR(igstAmount),

    grandTotal: formatINR(grandTotal),

    paymentMethod: booking.paymentMethod || "UPI",
    bank: {
      name: bankName,
      accountNumber: bankAccountNumber,
      ifsc: bankIfsc,
      branch: bankBranch,
    },

    terms,
    footerCredit,
    logoPath,
  };
}
