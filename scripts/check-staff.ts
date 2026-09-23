// Quick verification of seeded staff users + test login flow.
// Run with: DATABASE_URL=... npx tsx scripts/check-staff.ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("=== StaffUser rows ===");
  const staff = await db.staffUser.findMany({
    select: { name: true, email: true, role: true, pin: true, active: true, mustChangePassword: true },
  });
  console.table(staff);

  console.log("\n=== User rows (any User records created yet?) ===");
  const users = await db.user.findMany({ select: { id: true, name: true, email: true, role: true, staffId: true } });
  console.table(users);

  console.log("\n=== Session rows ===");
  const sessions = await db.session.count();
  console.log("Session count:", sessions);

  console.log("\n=== Setting rows (HOSTINGER_MAIL_TOKEN exists?) ===");
  const hostingerSettings = await db.setting.findMany({
    where: { key: { startsWith: "HOSTINGER" } },
    select: { key: true, isSet: true, isSecret: true, label: true },
  });
  console.table(hostingerSettings);

  console.log("\n=== FeatureFlag rows ===");
  const flags = await db.featureFlag.findMany({ select: { key: true, enabled: true } });
  console.table(flags);
}

main()
  .catch(e => { console.error("ERROR:", e?.message || e); process.exit(1); })
  .finally(() => db.$disconnect());
