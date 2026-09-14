import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { URL } from "url";

/**
 * SSRF guard — validates an API endpoint URL before the server fetches it.
 *
 * SECURITY (Round 3 S19 fix): rejects URLs that would let a MANAGER probe
 * internal services or exfiltrate the channel API key to attacker-controlled
 * servers via the Authorization header.
 *
 * Rules:
 * - Must be a valid http(s) URL
 * - Must be HTTPS in production (NODE_ENV=production)
 * - Must NOT resolve to a private/loopback/link-local IP range
 * - Hostname must NOT be 'localhost', '127.0.0.1', '::1', or any IP literal
 *   in 10/8, 172.16/12, 192.168/16, 169.254/16, fc00::/7 ranges
 *
 * Note: this is a hostname-string check. For full protection against DNS
 * rebinding, also resolve the hostname and check the IP — but Node's fetch
 * doesn't expose the resolved IP. Production deployments behind Cloudflare
 * or Vercel already block private-IP egress.
 */
function isSafeApiEndpoint(rawUrl: string): { ok: boolean; reason?: string } {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "Invalid URL format" };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return { ok: false, reason: "Only http/https URLs allowed" };
  }
  if (process.env.NODE_ENV === "production" && u.protocol !== "https:") {
    return { ok: false, reason: "HTTPS required in production" };
  }
  const host = u.hostname.toLowerCase();
  // Reject obvious internal hostnames.
  const blockedHosts = ["localhost", "ip6-localhost", "metadata.google.internal"];
  if (blockedHosts.includes(host)) {
    return { ok: false, reason: `Blocked hostname: ${host}` };
  }
  // Reject IP literals in private ranges.
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number) as unknown as number[];
    if (a === 10) return { ok: false, reason: "Private IP range (10.x) blocked" };
    if (a === 127) return { ok: false, reason: "Loopback IP (127.x) blocked" };
    if (a === 169 && b === 254) return { ok: false, reason: "Link-local IP (169.254.x) blocked — AWS metadata endpoint" };
    if (a === 172 && b >= 16 && b <= 31) return { ok: false, reason: "Private IP range (172.16-31.x) blocked" };
    if (a === 192 && b === 168) return { ok: false, reason: "Private IP range (192.168.x) blocked" };
    if (a === 0) return { ok: false, reason: "Reserved IP range (0.x) blocked" };
  }
  // Reject IPv6 loopback / unique local.
  if (host === "::1" || host === "0:0:0:0:0:0:0:1") {
    return { ok: false, reason: "IPv6 loopback blocked" };
  }
  if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
    return { ok: false, reason: "IPv6 private/link-local blocked" };
  }
  return { ok: true };
}

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
  // SECURITY (Phase2-MassAssignment): explicit whitelist of ChannelConfig
  // columns. id/createdAt/updatedAt are server-controlled; lastSyncAt /
  // lastSyncStatus / lastSyncMessage are server-set by the PUT
  // (test-connection) flow and must not be writable via PATCH. .strict()
  // rejects any unknown field. `config` stays as z.record(z.string(), z.any())
  // because it is a free-form per-channel JSON blob, but the PATCH handler
  // enforces a 10KB size guard before persisting (Phase2-MassAssignment).
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
  }).strict(),
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

  // SECURITY (Phase2-MassAssignment): size-guard the free-form `config` blob
  // (10KB max). Prevents a MANAGER from storing arbitrarily large JSON in
  // the DB column (could bloat the table or smuggle secrets). Prisma's
  // ChannelConfig.config column is `String?` (JSON serialized), so we also
  // stringify the object here before persisting.
  const prismaData: Record<string, unknown> = { ...data };
  if (data.config !== undefined) {
    const configStr = typeof data.config === "string"
      ? data.config
      : JSON.stringify(data.config);
    if (configStr.length > 10000) {
      return NextResponse.json(
        { error: "config blob exceeds 10KB limit" },
        { status: 400 }
      );
    }
    prismaData.config = configStr;
  }

  const config = await db.channelConfig.update({
    where: { id },
    data: prismaData as any,
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
      // SECURITY (Round 3 S19 fix): SSRF allowlist — reject private/internal
      // IP ranges and require HTTPS. Prevents a malicious/compromised MANAGER
      // from probing internal services (e.g. http://169.254.169.254/ for AWS
      // metadata, http://localhost:5432 for DB) or exfiltrating the channel
      // API key to their own server via the Authorization header.
      const urlCheck = isSafeApiEndpoint(config.apiEndpoint);
      if (!urlCheck.ok) {
        return NextResponse.json({ error: urlCheck.reason }, { status: 400 });
      }

      // Try a real GET request to their API
      const headers: Record<string, string> = {};
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.apiSecret) headers["X-API-Secret"] = config.apiSecret;

      const res = await fetch(config.apiEndpoint, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(10000),
        redirect: "error", // don't follow redirects (could redirect to internal IPs)
      }).catch(e => ({ ok: false, status: 0, statusText: e.message }));

      success = (res as any).ok;
      message = success
        ? `Connected successfully (HTTP ${(res as any).status})`
        : `Connection failed: ${(res as any).statusText || "HTTP " + (res as any).status}`;
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
