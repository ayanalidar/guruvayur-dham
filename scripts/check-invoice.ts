// Verify the new invoice CMS blocks + GST settings + Invoice model
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  console.log("=== Invoice CMS blocks ===");
  const invoiceBlocks = await db.contentBlock.findMany({
    where: { category: "invoice" },
    select: { key: true, value: true, label: true },
  });
  console.table(invoiceBlocks);

  console.log("\n=== GST rate settings ===");
  const gstSettings = await db.setting.findMany({
    where: { key: { startsWith: "GST_" } },
    select: { key: true, value: true, isSet: true, label: true },
  });
  console.table(gstSettings);

  console.log("\n=== Invoice table exists? ===");
  const count = await db.invoice.count();
  console.log("Invoice rows:", count);

  console.log("\n=== Booking fields present? ===");
  const sampleBooking = await db.booking.findFirst({
    select: { reference: true, guestGSTIN: true, guestAddress: true, arrivalTime: true, departureTime: true, paymentMethod: true },
  });
  console.log("Sample booking:", sampleBooking);
}
main().catch(e => console.error("ERR:", e?.message || e)).finally(() => db.$disconnect());
