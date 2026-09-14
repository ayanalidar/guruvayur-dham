/**
 * Seed default settings + feature flags into the DB.
 * Run after prisma db push: `npx tsx scripts/seed-settings.ts`
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS, DEFAULT_FEATURE_FLAGS } from "../src/lib/settings";

const db = new PrismaClient();

async function main() {
  console.log("Seeding default settings...");
  for (const s of DEFAULT_SETTINGS) {
    await db.setting.upsert({
      where: { key: s.key },
      create: {
        key: s.key,
        value: "", // empty — admin fills in via UI
        category: s.category,
        label: s.label,
        isSecret: s.isSecret,
        isSet: false, // not configured yet
      },
      update: {}, // don't overwrite existing values
    });
    console.log(`  ✓ ${s.key}`);
  }

  console.log("\nSeeding default feature flags...");
  for (const f of DEFAULT_FEATURE_FLAGS) {
    await db.featureFlag.upsert({
      where: { key: f.key },
      create: {
        key: f.key,
        label: f.label,
        description: f.description,
        enabled: f.enabled,
      },
      update: {}, // don't overwrite existing
    });
    console.log(`  ✓ ${f.key} = ${f.enabled}`);
  }

  console.log(`\n✅ Seeded ${DEFAULT_SETTINGS.length} settings + ${DEFAULT_FEATURE_FLAGS.length} feature flags`);
  console.log("Visit /#/admin/settings to configure integrations.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
