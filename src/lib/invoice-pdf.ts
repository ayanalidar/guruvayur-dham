/**
 * PDF generator for tax invoices.
 *
 * Uses pdfmake (lightweight, Vercel-compatible, ~600KB) to build the PDF
 * matching the sample invoice layout — dark red accents (#8B0000),
 * black address box, dark red table header, dark red G. TOTAL box,
 * dotted-line separators in customer/stay-details sections.
 *
 * Layout matches sample PDF exactly:
 *   1. Top bar: GSTIN | TAX INVOICE | Original
 *   2. Branding: logo + hotel name + black-bg address box + phone/email
 *   3. Invoice meta: INVOICE NO. | INVOICE | DATE (3-column)
 *   4. Customer + stay details: 2-column grid with dotted separators
 *   5. Items table: dark red header, single row per room
 *   6. Totals (right-aligned): Total → Taxable → CGST/SGST OR IGST → G. TOTAL box
 *   7. Payment method + bank details (left)
 *   8. Footer: 2-column (terms left, authorized right)
 *   9. Bottom: auto-generated disclaimer + jurisdiction + Powered By
 *
 * Output: Buffer containing the PDF binary.
 */

import path from "path";
import fs from "fs/promises";
import type { InvoiceData } from "@/lib/invoice";

// Dark red accent — matches sample invoice
const DARK_RED = "#8B0000";
const DARK_RED_LIGHT = "#A52A2A";
const TEXT_DARK = "#333333";
const TEXT_GREY = "#666666";
const LINE_GREY = "#CCCCCC";
const BG_BLACK = "#000000";

let printerInitialized = false;
let PdfPrinter: any = null;

async function initPrinter() {
  if (printerInitialized && PdfPrinter) return PdfPrinter;
  // Dynamic import — pdfmake uses Node fs module under the hood, so it must
  // run in the Node.js runtime (which is the default for Vercel functions).
  const printerMod = await import("pdfmake");
  PdfPrinter = (printerMod as any).default || (printerMod as any);
  // Register the bundled Roboto fonts (has ₹ glyph since 2014)
  const vfsMod: any = await import("pdfmake/build/vfs_fonts");
  PdfPrinter.vfs = vfsMod.vfs;
  // Roboto variants — defined inside vfs_fonts
  PdfPrinter.fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };
  printerInitialized = true;
  return PdfPrinter;
}

/**
 * Read a logo file and convert to base64 data URI.
 * Tries the local file first (Vercel bundles /public), falls back to
 * fetching from the deployed URL.
 */
async function loadLogoBase64(logoPath: string): Promise<string | null> {
  if (!logoPath) return null;
  try {
    // Resolve to absolute path. Accepts both /public/foo.png and public/foo.png.
    const abs = logoPath.startsWith("/")
      ? path.join(process.cwd(), logoPath)
      : path.join(process.cwd(), logoPath);
    const buf = await fs.readFile(abs);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // Fall back to fetching from the deployed site
    try {
      const url = logoPath.startsWith("http")
        ? logoPath
        : `https://www.guruvayurdham.co.in${logoPath.replace(/^.*\/public/, "")}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const buf = Buffer.from(await r.arrayBuffer());
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
}

/**
 * Build the pdfmake document definition for the invoice.
 * Pure data — no rendering. The actual PDF is rendered by createPdfKitDocument.
 */
function buildDocDefinition(data: InvoiceData, logoBase64: string | null): any {
  // Helpers — dotted-line separator for customer/stay-details sections
  const dottedRow = (label: string, value: string): any => ({
    columns: [
      { text: label, bold: true, fontSize: 10, color: TEXT_DARK, width: 80 },
      { text: value, fontSize: 10, color: TEXT_DARK },
    ],
    margin: [0, 2, 0, 2],
  });

  // Total row (right-aligned, no border)
  const totalRow = (label: string, value: string, isBoxed = false): any => {
    if (isBoxed) {
      // Dark red box for G. TOTAL — white text, full width of totals column
      return {
        stack: [
          {
            columns: [
              { text: label, fontSize: 12, bold: true, color: "#FFFFFF", fillColor: DARK_RED },
              { text: value, fontSize: 12, bold: true, color: "#FFFFFF", alignment: "right", fillColor: DARK_RED },
            ],
            margin: [4, 6, 4, 6],
          },
        ],
        // Fill the row with dark red
        background: DARK_RED,
        margin: [0, 4, 0, 0],
      };
    }
    return {
      columns: [
        { text: label, fontSize: 10, color: TEXT_DARK, alignment: "right", width: "*" },
        { text: value, fontSize: 10, color: TEXT_DARK, alignment: "right", width: 100 },
      ],
      margin: [0, 1, 0, 1],
    };
  };

  // Build customer + stay details 2-column grid with dotted separators
  const customerStayBlock = {
    stack: [
      // Customer row
      {
        columns: [
          dottedRow("Name:", data.toName),
          dottedRow("Mob:", data.toPhone),
        ],
      },
      {
        columns: [
          dottedRow("GSTIN:", data.toGSTIN),
          dottedRow("Address:", data.toAddress),
        ],
      },
      {
        columns: [
          dottedRow("Room:", data.roomName),
          { text: "", width: "*" },
        ],
      },
      // Stay details row
      {
        columns: [
          {
            columns: [
              { text: "A/D Date:", bold: true, fontSize: 10, color: TEXT_DARK, width: 70 },
              { text: `${data.arrivalDate}  ${data.arrivalTime}`, fontSize: 10, color: TEXT_DARK, width: "auto" },
            ],
            margin: [0, 2, 0, 2],
            width: "*",
          },
          {
            columns: [
              { text: "D/I Date:", bold: true, fontSize: 10, color: TEXT_DARK, width: 70 },
              { text: `${data.departureDate}  ${data.departureTime}`, fontSize: 10, color: TEXT_DARK, width: "auto" },
            ],
            margin: [0, 2, 0, 2],
            width: "*",
          },
          {
            columns: [
              { text: "Nights:", bold: true, fontSize: 10, color: TEXT_DARK, width: 50 },
              { text: String(data.nights), fontSize: 10, color: TEXT_DARK, width: "auto" },
            ],
            margin: [0, 2, 0, 2],
            width: "auto",
          },
        ],
      },
    ],
    margin: [0, 10, 0, 10],
  };

  // Items table body
  const tableHeader = [
    { text: "SR. NO.", style: "tableHeader", alignment: "center" },
    { text: "PARTICULARS", style: "tableHeader", alignment: "left" },
    { text: "RATE", style: "tableHeader", alignment: "center" },
    { text: "AMOUNT", style: "tableHeader", alignment: "right" },
  ];

  const tableRows = data.items.map((it) => [
    { text: String(it.srNo), alignment: "center", fontSize: 10, color: TEXT_DARK },
    { text: it.description, alignment: "left", fontSize: 10, color: TEXT_DARK },
    { text: it.rate, alignment: "center", fontSize: 10, color: TEXT_DARK },
    { text: it.amount, alignment: "right", fontSize: 10, color: TEXT_DARK },
  ]);

  // Tax lines — only show non-zero rates
  const taxLines: any[] = [];
  if (data.igstRate > 0) {
    taxLines.push(totalRow(`IGST (${data.igstRate}%)`, data.igstAmount));
  } else {
    if (data.cgstRate > 0) taxLines.push(totalRow(`CGST (${data.cgstRate}%)`, data.cgstAmount));
    if (data.sgstRate > 0) taxLines.push(totalRow(`SGST (${data.sgstRate}%)`, data.sgstAmount));
  }

  // Totals stack (right-aligned column)
  const totalsStack = {
    stack: [
      totalRow("Total", data.subtotal),
      totalRow("Taxable Amount", data.taxableAmount),
      ...taxLines,
      totalRow("G. TOTAL", data.grandTotal, true),
    ],
    width: 280,
    margin: [0, 4, 0, 10],
    alignment: "right" as const,
  };

  // Bank details block (left, below totals)
  const bankBlock = {
    stack: [
      { text: "BANK DETAILS", bold: true, fontSize: 10, color: DARK_RED, decoration: "underline", margin: [0, 0, 0, 4] },
      dottedRow("Name:", data.bank.name),
      dottedRow("Account No:", data.bank.accountNumber),
      dottedRow("IFSC:", data.bank.ifsc),
      dottedRow("Branch:", data.bank.branch),
    ],
    width: 250,
    margin: [0, 8, 0, 0],
  };

  // Footer — 2 columns: terms (left) + authorized (right)
  const footerBlock = {
    columns: [
      // Left: terms + customer signature
      {
        stack: [
          { text: "E. & O. E.", italics: true, fontSize: 8, color: TEXT_GREY },
          { text: "TERMS & CONDITIONS", bold: true, fontSize: 10, color: DARK_RED, decoration: "underline", margin: [0, 4, 0, 2] },
          ...data.terms.map((t, i) => ({
            text: `${i + 1}. ${t.replace(/^\d+\.\s*/, "")}`,
            fontSize: 9, color: TEXT_DARK, margin: [0, 0, 0, 1],
          })),
          { text: "", margin: [0, 20, 0, 0] },
          {
            canvas: [
              {
                type: "line",
                x1: 0, y1: 0, x2: 200, y2: 0,
                lineWidth: 1, lineColor: TEXT_DARK,
              },
            ],
            margin: [0, 30, 0, 2],
          },
          { text: "Customer Signature", fontSize: 9, color: TEXT_GREY },
        ],
        width: "*",
      },
      // Right: authorized signatory
      {
        stack: [
          { text: "Certified that the particulars given above are true and correct", italics: true, fontSize: 9, color: TEXT_GREY, alignment: "center", margin: [0, 0, 0, 20] },
          { text: "FOR: HOTEL GURUVAYUR DHAM", bold: true, fontSize: 12, color: DARK_RED, alignment: "center", margin: [0, 20, 0, 2] },
          { text: "AUTHORISED SIGNATORY", fontSize: 8, color: TEXT_GREY, alignment: "center" },
        ],
        width: 200,
        alignment: "center" as const,
      },
    ],
    margin: [0, 20, 0, 0],
  };

  // Build the top branding row (logo + hotel name + address box)
  const brandingRow: any = {
    columns: [
      // Logo
      logoBase64
        ? {
            image: logoBase64,
            width: 120,
            height: 60,
            margin: [0, 0, 10, 0],
          }
        : { text: "", width: 120 },
      // Hotel name + address + phone/email
      {
        stack: [
          { text: data.fromName.toUpperCase(), bold: true, fontSize: 22, color: DARK_RED, alignment: "center" as const },
          {
            // Black-bg address box
            stack: [{ text: data.fromAddress, color: "#FFFFFF", fontSize: 9, alignment: "center" as const }],
            background: BG_BLACK,
            margin: [0, 4, 0, 4],
            padding: [3, 3, 3, 3],
          },
          {
            text: `Mob: ${data.fromPhones}  |  Email: ${data.fromEmail}`,
            fontSize: 9, color: TEXT_DARK, alignment: "center" as const,
          },
        ],
        width: "*",
      },
      // Empty right spacer
      { text: "", width: 100 },
    ],
    margin: [0, 6, 0, 6],
  };

  // Build the full document
  return {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 30],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: TEXT_DARK,
      lineHeight: 1.15,
    },
    styles: {
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: "#FFFFFF",
        fillColor: DARK_RED,
      },
    },
    content: [
      // 1. Top bar (3-column)
      {
        columns: [
          { text: `GSTIN: ${data.fromGSTIN}`, fontSize: 9, color: TEXT_DARK, width: "*" },
          { text: "TAX INVOICE", bold: true, fontSize: 13, color: DARK_RED, alignment: "center" as const, width: "*", characterSpacing: 2 },
          { text: "Original", italics: true, fontSize: 9, color: TEXT_GREY, alignment: "right" as const, width: "*" },
        ],
        margin: [0, 0, 0, 4],
      },
      // Thin grey separator
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: LINE_GREY }], margin: [0, 0, 0, 4] },

      // 2. Branding row
      brandingRow,

      // 3. Invoice meta (3-column: NO | INVOICE | DATE)
      {
        columns: [
          {
            stack: [
              { text: "INVOICE NO.", fontSize: 8, color: TEXT_GREY, characterSpacing: 1 },
              { text: data.invoiceNumber, bold: true, fontSize: 14, color: TEXT_DARK },
            ],
            width: 120,
          },
          {
            text: "INVOICE",
            bold: true,
            fontSize: 22,
            color: DARK_RED,
            alignment: "center" as const,
            characterSpacing: 4,
            width: "*",
          },
          {
            stack: [
              { text: "DATE", fontSize: 8, color: TEXT_GREY, alignment: "right" as const, characterSpacing: 1 },
              { text: data.invoiceDate, bold: true, fontSize: 12, color: TEXT_DARK, alignment: "right" as const },
            ],
            width: 120,
          },
        ],
        margin: [0, 8, 0, 8],
      },
      // Thin grey separator below invoice meta
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: LINE_GREY }], margin: [0, 0, 0, 4] },

      // 4. Customer + stay details block
      customerStayBlock,

      // 5. Items table
      {
        table: {
          widths: [50, "*", 100, 100],
          headerRow: true,
          body: [tableHeader, ...tableRows],
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? DARK_RED : null,
          hLineColor: () => LINE_GREY,
          vLineColor: () => LINE_GREY,
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 0, 0, 4],
      },

      // 6. Totals + bank row
      {
        columns: [
          // Left: payment method + bank
          {
            stack: [
              { text: `Payment Method: ${data.paymentMethod}`, fontSize: 10, color: TEXT_DARK, margin: [0, 0, 0, 8] },
              bankBlock,
            ],
            width: "*",
          },
          // Right: totals (right-aligned)
          {
            stack: [totalsStack],
            alignment: "right" as const,
            width: 300,
          },
        ],
        margin: [0, 0, 0, 12],
      },

      // 7. Footer (2-column: terms + authorized)
      footerBlock,

      // 8. Bottom disclaimers (centered)
      {
        stack: [
          { text: "This is an auto-generated copy, doesn't require any signature.", italics: true, fontSize: 8, color: TEXT_GREY, alignment: "center" as const, margin: [0, 14, 0, 1] },
          { text: "All disputes are subject to the jurisdiction of Mathura, Uttar Pradesh Only.", italics: true, fontSize: 8, color: TEXT_GREY, alignment: "center" as const, margin: [0, 0, 0, 4] },
          {
            columns: [
              { text: "", width: "*" },
              {
                stack: [
                  {
                    text: [
                      { text: "Powered By: ", fontSize: 9, color: TEXT_GREY },
                      { text: "GUARDIANX", fontSize: 9, color: DARK_RED, bold: true },
                    ],
                  },
                ],
                alignment: "center" as const,
                width: "auto",
              },
              { text: "", width: "*" },
            ],
            margin: [0, 4, 0, 0],
          },
        ],
      },
    ],
  };
}

/**
 * Generate the PDF buffer for an invoice.
 *
 * Usage:
 *   const pdfBuffer = await generateInvoicePdf(invoiceData);
 *   // pdfBuffer is a Node.js Buffer containing the PDF binary
 *   // → send as response, attach to email, save to S3, etc.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const Printer = await initPrinter();
  const logoBase64 = await loadLogoBase64(data.logoPath);
  const docDefinition = buildDocDefinition(data, logoBase64);

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const pdfDoc = Printer.createPdfKitDocument(docDefinition, {});
      const chunks: Buffer[] = [];
      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", (err: any) => reject(err));
      pdfDoc.end();
    } catch (e) {
      reject(e);
    }
  });
}
