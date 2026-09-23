/**
 * PDF generator for tax invoices.
 *
 * Uses pdfmake v0.3 (lightweight, Vercel-compatible, ~600KB) to build
 * the PDF matching the sample invoice layout — dark red accents (#8B0000),
 * black address box, dark red table header, dark red G. TOTAL box,
 * dotted-line separators in customer/stay-details sections.
 *
 * pdfmake v0.3 API:
 *   - import('pdfmake') returns an INSTANCE (not the Printer class)
 *   - instance has createPdf(docDefinition, options) → OutputDocumentServer
 *   - OutputDocumentServer.getBuffer() → Promise<Buffer>
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
const TEXT_DARK = "#333333";
const TEXT_GREY = "#666666";
const LINE_GREY = "#CCCCCC";
const BG_BLACK = "#000000";

// Singleton pdfmake instance (instantiated once per cold start, reused)
let pdfmakeInstance: any = null;

async function initPdfmake(): Promise<any> {
  if (pdfmakeInstance) return pdfmakeInstance;
  // pdfmake v0.3 — the main entry exports an instance of the base class.
  // Dynamic import works in Vercel serverless Node runtime.
  const mod: any = await import("pdfmake");
  // The actual instance is wrapped — find it through multiple fallbacks.
  const instance = mod.default || mod["module.exports"] || mod.default?.["module.exports"] || mod;

  // Load the bundled Roboto fonts VFS (has ₹ glyph since 2014).
  // ESM import() requires explicit .js extension — pdfmake's vfs_fonts.js
  // exports each font DIRECTLY as a top-level property (NOT nested under .vfs).
  let vfsMod: any;
  try {
    vfsMod = await import("pdfmake/build/vfs_fonts.js");
  } catch {
    // Fallback to bare specifier (some bundlers like Next.js handle this)
    vfsMod = await import("pdfmake/build/vfs_fonts");
  }
  // Also try require() if both imports failed (Edge/Node interop)
  if (!vfsMod || (typeof vfsMod !== "object" && typeof vfsMod !== "function")) {
    const createRequire = (await import("module")).default?.createRequire;
    if (createRequire) {
      const req = createRequire(import.meta.url);
      vfsMod = req("pdfmake/build/vfs_fonts");
    }
  }
  // vfsMod.vfs might exist in some versions; otherwise fonts are inside .default
  // (ESM wraps CJS exports under .default when dynamic-imported)
  const vfsData = vfsMod.vfs || vfsMod.default || vfsMod["module.exports"] || vfsMod;
  if (instance.virtualfs && instance.virtualfs.storage) {
    for (const [filename, content] of Object.entries(vfsData)) {
      // Skip non-font keys (like __esModule, default). Only process string
      // values — VFS font entries are base64-encoded strings.
      if (typeof content !== "string") continue;
      try {
        instance.virtualfs.writeFileSync(filename, content, "base64");
      } catch {
        instance.virtualfs.storage[filename] = Buffer.from(content, "base64");
      }
    }
  } else {
    instance.virtualfs = { storage: {} };
    for (const [filename, content] of Object.entries(vfsData)) {
      if (typeof content !== "string") continue;
      instance.virtualfs.storage[filename] = Buffer.from(content, "base64");
    }
  }

  // Register fonts config — Roboto variants (must match VFS keys).
  instance.setFonts({
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  });

  pdfmakeInstance = instance;
  return instance;
}

/**
 * Read a logo file and convert to base64 data URI.
 * Tries the local file first (Vercel bundles /public), falls back to
 * fetching from the deployed URL.
 */
async function loadLogoBase64(logoPath: string): Promise<string | null> {
  if (!logoPath) return null;
  try {
    const abs = logoPath.startsWith("/")
      ? path.join(process.cwd(), logoPath)
      : path.join(process.cwd(), logoPath);
    const buf = await fs.readFile(abs);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
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
 */
function buildDocDefinition(data: InvoiceData, logoBase64: string | null): any {
  // Helpers — bold label + value row, used in customer/stay sections
  const dottedRow = (label: string, value: string): any => ({
    columns: [
      { text: label, bold: true, fontSize: 10, color: TEXT_DARK, width: 80 },
      { text: value, fontSize: 10, color: TEXT_DARK },
    ],
    margin: [0, 2, 0, 2],
  });

  // Total row — right-aligned, no border (except G. TOTAL which is boxed)
  const totalRow = (label: string, value: string, isBoxed = false): any => {
    if (isBoxed) {
      // Dark red box for G. TOTAL — white text
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

  // Customer + stay details block
  const customerStayBlock = {
    stack: [
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

  // Items table
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

  // Totals stack (right-aligned)
  const totalsStack = {
    stack: [
      totalRow("Total", data.subtotal),
      totalRow("Taxable Amount", data.taxableAmount),
      ...taxLines,
      totalRow("G. TOTAL", data.grandTotal, true),
    ],
    width: 280,
    margin: [0, 4, 0, 10],
  };

  // Bank details
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

  // Footer — 2 columns
  const footerBlock = {
    columns: [
      {
        stack: [
          { text: "E. & O. E.", italics: true, fontSize: 8, color: TEXT_GREY },
          { text: "TERMS & CONDITIONS", bold: true, fontSize: 10, color: DARK_RED, decoration: "underline", margin: [0, 4, 0, 2] },
          ...data.terms.map((t) => ({
            text: t.replace(/^\d+\.\s*/, "").match(/^\d+\./) ? t : `${data.terms.indexOf(t) + 1}. ${t}`,
            fontSize: 9, color: TEXT_DARK, margin: [0, 0, 0, 1],
          })),
          { text: "", margin: [0, 20, 0, 0] },
          {
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1, lineColor: TEXT_DARK }],
            margin: [0, 30, 0, 2],
          },
          { text: "Customer Signature", fontSize: 9, color: TEXT_GREY },
        ],
        width: "*",
      },
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

  // Branding row (logo + hotel info)
  const brandingRow: any = {
    columns: [
      logoBase64
        ? { image: logoBase64, width: 120, height: 60, margin: [0, 0, 10, 0] }
        : { text: "", width: 120 },
      {
        stack: [
          { text: data.fromName.toUpperCase(), bold: true, fontSize: 22, color: DARK_RED, alignment: "center" as const },
          {
            stack: [{ text: data.fromAddress, color: "#FFFFFF", fontSize: 9, alignment: "center" as const }],
            background: BG_BLACK,
            margin: [0, 4, 0, 4],
          },
          {
            text: `Mob: ${data.fromPhones}  |  Email: ${data.fromEmail}`,
            fontSize: 9, color: TEXT_DARK, alignment: "center" as const,
          },
        ],
        width: "*",
      },
      { text: "", width: 100 },
    ],
    margin: [0, 6, 0, 6],
  };

  return {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 30],
    defaultStyle: { font: "Roboto", fontSize: 10, color: TEXT_DARK, lineHeight: 1.15 },
    styles: {
      tableHeader: { bold: true, fontSize: 10, color: "#FFFFFF", fillColor: DARK_RED },
    },
    content: [
      // 1. Top bar
      {
        columns: [
          { text: `GSTIN: ${data.fromGSTIN}`, fontSize: 9, color: TEXT_DARK, width: "*" },
          { text: "TAX INVOICE", bold: true, fontSize: 13, color: DARK_RED, alignment: "center" as const, width: "*", characterSpacing: 2 },
          { text: "Original", italics: true, fontSize: 9, color: TEXT_GREY, alignment: "right" as const, width: "*" },
        ],
        margin: [0, 0, 0, 4],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: LINE_GREY }], margin: [0, 0, 0, 4] },

      // 2. Branding
      brandingRow,

      // 3. Invoice meta
      {
        columns: [
          {
            stack: [
              { text: "INVOICE NO.", fontSize: 8, color: TEXT_GREY, characterSpacing: 1 },
              { text: data.invoiceNumber, bold: true, fontSize: 14, color: TEXT_DARK },
            ],
            width: 120,
          },
          { text: "INVOICE", bold: true, fontSize: 22, color: DARK_RED, alignment: "center" as const, characterSpacing: 4, width: "*" },
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
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: LINE_GREY }], margin: [0, 0, 0, 4] },

      // 4. Customer + stay
      customerStayBlock,

      // 5. Items table
      {
        table: {
          widths: [50, "*", 100, 100],
          headerRow: true,
          body: [tableHeader, ...tableRows],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? DARK_RED : null),
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
          {
            stack: [
              { text: `Payment Method: ${data.paymentMethod}`, fontSize: 10, color: TEXT_DARK, margin: [0, 0, 0, 8] },
              bankBlock,
            ],
            width: "*",
          },
          { stack: [totalsStack], alignment: "right" as const, width: 300 },
        ],
        margin: [0, 0, 0, 12],
      },

      // 7. Footer
      footerBlock,

      // 8. Bottom disclaimers
      {
        stack: [
          { text: "This is an auto-generated copy, doesn't require any signature.", italics: true, fontSize: 8, color: TEXT_GREY, alignment: "center" as const, margin: [0, 14, 0, 1] },
          { text: "All disputes are subject to the jurisdiction of Mathura, Uttar Pradesh Only.", italics: true, fontSize: 8, color: TEXT_GREY, alignment: "center" as const, margin: [0, 0, 0, 4] },
          {
            columns: [
              { text: "", width: "*" },
              {
                stack: [{
                  text: [
                    { text: "Powered By: ", fontSize: 9, color: TEXT_GREY },
                    { text: "GUARDIANX", fontSize: 9, color: DARK_RED, bold: true },
                  ],
                }],
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
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const pdfmake = await initPdfmake();
  const logoBase64 = await loadLogoBase64(data.logoPath);
  const docDefinition = buildDocDefinition(data, logoBase64);

  // pdfmake v0.3 API: instance.createPdf() returns an OutputDocumentServer
  // which has a getBuffer() method returning a Promise<Buffer>.
  const pdfDoc = pdfmake.createPdf(docDefinition, {});
  const buffer: Buffer = await pdfDoc.getBuffer();
  return buffer;
}
