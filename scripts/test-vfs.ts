async function main() {
  const mod: any = await import("../src/lib/invoice-pdf.ts");
  // Try calling generateInvoicePdf with a minimal doc to trigger initPdfmake
  const data = {
    invoiceNumber: "T", invoiceDate: "1 Jan 2026", dueDate: "1 Jan 2026",
    fromName: "Test", fromAddress: "Test", fromPhones: "+91 1", fromEmail: "test@x.com",
    fromGSTIN: "09", toName: "T", toAddress: "", toPhone: "", toEmail: "", toGSTIN: "",
    roomName: "R", arrivalDate: "1 Jan 2026", arrivalTime: "", departureDate: "2 Jan 2026",
    departureTime: "", nights: 1, items: [{ srNo: 1, description: "Test", rate: "1 x ₹1.00", amount: "₹1.00" }],
    subtotal: "₹1.00", taxableAmount: "₹1.00", cgstRate: 0, sgstRate: 0, igstRate: 0,
    cgstAmount: "₹0", sgstAmount: "₹0", igstAmount: "₹0", grandTotal: "₹1.00",
    paymentMethod: "UPI", bank: { name: "X", accountNumber: "1", ifsc: "X", branch: "X" },
    terms: [], footerCredit: "", logoPath: "",
  };
  try {
    const buf = await mod.generateInvoicePdf(data);
    console.log("✓ PDF size:", buf.length);
    console.log("First 8 chars:", buf.slice(0, 8).toString("utf-8"));
  } catch (e: any) {
    console.error("✗ Error:", e.message);
  }
}
main().catch(e => console.error("ERR:", e));
