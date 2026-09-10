import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/channel-config
 * Returns all channel partner configurations (API keys masked)
 */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const where: any = {};
  if (category) where.category = category;

  const configs = await db.channelConfig.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Mask API keys for security (show only last 4 chars)
  const masked = configs.map(c => ({
    ...c,
    apiKey: c.apiKey ? `****${c.apiKey.slice(-4)}` : null,
    apiSecret: c.apiSecret ? `****${c.apiSecret.slice(-4)}` : null,
  }));

  return NextResponse.json({ configs: masked });
}

/**
 * POST /api/channel-config
 * Add a new channel partner configuration
 * body: { code, name, category, apiEndpoint?, webhookUrl?, apiKey?, apiSecret?, hotelId?, config? }
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name, category, apiEndpoint, webhookUrl, apiKey, apiSecret, hotelId, config } = body;

  if (!code || !name) {
    return NextResponse.json({ error: "code and name required" }, { status: 400 });
  }

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
  const { id, data } = await req.json();

  // If apiKey or apiSecret provided, mark as connected
  if (data.apiKey || data.apiSecret) {
    data.connected = true;
  }

  const config = await db.channelConfig.update({
    where: { id },
    data,
  });

  return NextResponse.json({ config, message: "Channel updated" });
}

/**
 * DELETE /api/channel-config?id=xxx
 */
export async function DELETE(req: NextRequest) {
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
  const { id } = await req.json();
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
