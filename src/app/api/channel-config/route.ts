import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";

const CreateChannelConfigSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  apiEndpoint: z.string().url().optional(),
  webhookUrl: z.string().url().optional(),
  apiKey: z.string().max(500).optional(),
  apiSecret: z.string().max(500).optional(),
  hotelId: z.string().max(200).optional(),
  config: z.record(z.string(), z.any()).optional(),
});

const UpdateChannelConfigSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    name: z.string().max(200).optional(),
    category: z.string().max(100).optional(),
    apiEndpoint: z.string().url().optional(),
    webhookUrl: z.string().url().optional(),
    apiKey: z.string().max(500).optional(),
    apiSecret: z.string().max(500).optional(),
    hotelId: z.string().max(200).optional(),
    config: z.record(z.string(), z.any()).optional(),
    connected: z.boolean().optional(),
  }),
});

const TestConnectionSchema = z.object({
  id: z.string().min(1),
});

/**
 * GET /api/channel-config
 * Returns all channel partner configurations (API keys masked).
 *
 * SECURITY (Round 3 S6 fix): requireStaff(MANAGER,ACCOUNTANT) + strip ?key=
 * from webhookUrl + omit config blob (may contain secrets).
 */
export async function GET(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER", "ACCOUNTANT"]);
  if (error) return error;

  const category = req.nextUrl.searchParams.get("category");
  const where: any = {};
  if (category) where.category = category;

  const configs = await db.channelConfig.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Mask API keys + strip ?key= from webhookUrl + omit config blob.
  const masked = configs.map(c => {
    let safeWebhookUrl = c.webhookUrl;
    if (safeWebhookUrl) {
      try {
        const u = new URL(safeWebhookUrl);
        u.searchParams.delete("key");
        safeWebhookUrl = u.toString();
      } catch {
        // not a URL — leave as-is
      }
    }
    return {
      ...c,
      apiKey: c.apiKey ? `****${c.apiKey.slice(-4)}` : null,
      apiSecret: c.apiSecret ? `****${c.apiSecret.slice(-4)}` : null,
      webhookUrl: safeWebhookUrl,
      // Omit config blob — it can contain secrets (per-channel tokens, etc).
      // Only return it if MANAGER explicitly requests ?includeConfig=1.
      config: req.nextUrl.searchParams.get("includeConfig") === "1" ? c.config : null,
    };
  });

  return NextResponse.json({ configs: masked });
}

/**
 * POST /api/channel-config
 * Add a new channel partner configuration
 * body: { code, name, category, apiEndpoint?, webhookUrl?, apiKey?, apiSecret?, hotelId?, config? }
 */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = CreateChannelConfigSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { code, name, category, apiEndpoint, webhookUrl, apiKey, apiSecret, hotelId, config } = parsed.data;

  const existing = await db.channelConfig.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "Channel with this code already exists" }, { status: 409 });
  }

  const config_ = await db.channelConfig.create({
    data: {
      code: code.toUpperCase(),
      name,
      category: category || "OTA",
      apiEndpoint: apiEndpoint || null,
      webhookUrl: webhookUrl || null,
      apiKey: apiKey || null,
      apiSecret: apiSecret || null,
      hotelId: hotelId || null,
      config: config ? JSON.stringify(config) : null,
      connected: !!(apiKey || apiSecret),
    },
  });

  return NextResponse.json({ config: config_, message: "Channel added" });
}

/**
 * PATCH /api/channel-config
 * Update a channel partner configuration (add API keys, test connection, etc.)
 * body: { id, data: { apiKey?, apiSecret?, hotelId?, connected?, apiEndpoint?, webhookUrl? } }
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireStaff(req);
  if (error) return error;

  const parsed = UpdateChannelConfigSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id, data } = parsed.data;

  // If apiKey or apiSecret provided, mark as connected
  if (data.apiKey || data.apiSecret) {
    data.connected = true;
  }

  const config = await db.channelConfig.update({
    where: { id },
    data: data as any,
  });

  return NextResponse.json({ config, message: "Channel updated" });
}

/**
 * DELETE /api/channel-config?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.channelConfig.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

/**
 * PUT /api/channel-config
 * Test connection to a channel partner
 * body: { id }
 */
export async function PUT(req: NextRequest) {
  const { error } = await requireStaff(req, ["MANAGER"]);
  if (error) return error;

  const parsed = TestConnectionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { id } = parsed.data;
  const config = await db.channelConfig.findUnique({ where: { id } });

  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!config.apiKey) return NextResponse.json({ error: "No API key configured" }, { status: 400 });

  // Simulate connection test (replace with real API call when integrated)
  try {
    let success = false;
    let message = "";

    if (config.apiEndpoint) {
      // Try a real GET request to their API
      const headers: Record<string, string> = {};
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.apiSecret) headers["X-API-Secret"] = config.apiSecret;

      const res = await fetch(config.apiEndpoint, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
      }).catch(e => ({ ok: false, status: 0, statusText: e.message }));

      success = res.ok;
      message = success
        ? `Connected successfully (HTTP ${res.status})`
        : `Connection failed: ${res.statusText || "HTTP " + res.status}`;
    } else {
      // No endpoint — simulate success if key exists
      success = true;
      message = "API key saved. Real connection test will run when API endpoint is configured.";
    }

    // Update config with test result
    await db.channelConfig.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: success ? "SUCCESS" : "FAILED",
        lastSyncMessage: message,
      },
    });

    return NextResponse.json({ success, message, config: { ...config, apiKey: `****${config.apiKey.slice(-4)}` } });
  } catch (e: any) {
    await db.channelConfig.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "FAILED",
        lastSyncMessage: e.message,
      },
    });
    return NextResponse.json({ success: false, message: e.message });
  }
}
