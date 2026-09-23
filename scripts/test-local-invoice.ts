import { SITE } from "../src/lib/site-data";
import { formatINR, formatDateIndian } from "../src/lib/invoice";
import { generateInvoicePdf } from "../src/lib/invoice-pdf";
import { writeFileSync } from "fs";

async function main() {
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
      { srNo: 1, description: "Suite — Room Charges", rate: `2 × ${formatINR(2800)}`, amount: formatINR(5600) },
    ],
    subtotal: formatINR(5600),
    taxableAmount: formatINR(5600),
    cgstRate: 2.5, sgstRate: 2.5, igstRate: 0,
    cgstAmount: formatINR(140), sgstAmount: formatINR(140), igstAmount: formatINR(0),
    grandTotal: formatINR(5880),
    paymentMethod: "UPI",
    bank: SITE.bank,
    terms: [
      "Subjected to Mathura jurisdiction only.",
      "Goods once sold will not be taken back.",
      "Interest @ 24% p.a. will be charged if bill not paid within 15 days.",
    ],
    footerCredit: "Powered By: GUARDIANX",
    logoPath: "/public/logo-large.png",
  };
  const buf = await generateInvoicePdf(demoData as any);
  writeFileSync("/tmp/test-invoice-local.pdf", buf);
  console.log("✓ Generated PDF — size:", buf.length, "bytes");
  console.log("First 8 bytes:", buf.slice(0, 8).toString("utf-8"));
}
main().catch(e => { console.error("ERR:", e); process.exit(1); });
