// Delete the legacy .com staff users (and their User records + sessions)
// so the new .co.in staff (Krishnan Sharma etc.) can log in without
// hitting the phone-unique-constraint violation on db.user.create().
//
// Run with: DATABASE_URL=... npx tsx scripts/cleanup-legacy-staff.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  console.log("Looking for legacy .com staff users to delete...");

  const legacyStaff = await db.staffUser.findMany({
    where: { email: { endsWith: "@guruvayurdham.com" } },
    select: { id: true, name: true, email: true, role: true, pin: true },
  });
  console.log(`Found ${legacyStaff.length} legacy staff users:`);
  console.table(legacyStaff);

  if (legacyStaff.length === 0) {
    console.log("Nothing to delete — exiting.");
    return;
  }

  const legacyStaffIds = legacyStaff.map((s) => s.id);
  const legacyEmails = legacyStaff.map((s) => s.email);

  // 1. Delete sessions for any User that points at these staff
  const legacyUsers = await db.user.findMany({
    where: { staffId: { in: legacyStaffIds } },
    select: { id: true, name: true, email: true },
  });
  console.log(`Found ${legacyUsers.length} User rows linked to legacy staff:`);
  console.table(legacyUsers);

  if (legacyUsers.length > 0) {
    const userIds = legacyUsers.map((u) => u.id);
    const s1 = await db.session.deleteMany({ where: { userId: { in: userIds } } });
    console.log(`Deleted ${s1.count} sessions.`);
    // Also delete users whose EMAIL is .com (in case staffId is null but email matched)
    const s1b = await db.session.deleteMany({
      where: { user: { email: { in: legacyEmails } } },
    });
    console.log(`Deleted ${s1b.count} additional sessions by email match.`);
  }

  // 2. Delete User rows with .com emails (whether or not staffId was set)
  const u1 = await db.user.deleteMany({ where: { email: { in: legacyEmails } } });
  console.log(`Deleted ${u1.count} User rows with .com emails.`);

  // 3. Delete the StaffUser rows
  const st1 = await db.staffUser.deleteMany({ where: { id: { in: legacyStaffIds } } });
  console.log(`Deleted ${st1.count} StaffUser rows.`);

  // 4. Verify what's left
  const remaining = await db.staffUser.findMany({
    select: { name: true, email: true, role: true, pin: true },
  });
  console.log(`\n=== Remaining StaffUser rows (${remaining.length}) ===`);
  console.table(remaining);
}

main()
  .catch((e) => {
    console.error("ERROR:", e?.message || e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
