// Verify phone-conflict hypothesis
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, staffId: true } });
  console.table(users);
  const staff = await db.staffUser.findMany({ select: { name: true, email: true, phone: true, role: true, pin: true } });
  console.table(staff);
}
main().catch(e => console.error("ERR:", e?.message || e)).finally(() => db.$disconnect());
