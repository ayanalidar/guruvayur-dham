/**
 * Hostinger Mail API client.
 *
 * Sends transactional emails via Hostinger's Agentic Mail REST API
 * (https://api.mail.hostinger.com). Replaces nodemailer SMTP setup —
 * requires only 2 secrets instead of 5 (SMTP_HOST/PORT/USER/PASS/FROM_EMAIL).
 *
 * Required settings (encrypted in Setting table, editable in /admin/system):
 *   - HOSTINGER_MAIL_TOKEN     (Bearer token from hPanel → Agentic Mail → API)
 *   - HOSTINGER_MAILBOX_ID     (mailboxResourceId from /api/v1/me — e.g. "AC1a2b3c4d5e6f7g")
 *
 * Optional settings:
 *   - HOSTINGER_MAIL_DISPLAY_NAME (defaults to "Guruvayur Dham")
 *
 * API reference: https://github.com/hostinger/mail-api-php-sdk
 *   POST /api/v1/mailboxes/{mailboxResourceId}/send
 *   Body: { to: string[], subject: string, text: string, html?: string, displayName?: string, ... }
 *   Auth: Authorization: Bearer <token>
 *   Response: empty body (204 No Content on success)
 *
 * Fallback: if Hostinger Mail is not configured but SMTP settings are present,
 * callers should fall back to nodemailer (kept in code for backwards compat).
 */

import { getSetting } from "@/lib/settings";
import { withRetry } from "@/lib/retry";

const HOSTINGER_MAIL_BASE = "https://api.mail.hostinger.com";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  displayName?: string;
}

export interface SendEmailResult {
  ok: boolean;
  method: "hostinger-mail" | "none";
  message: string;
  responseStatus?: number;
  responseBody?: string;
}

/**
 * Check if Hostinger Mail is configured (token + mailbox ID both present).
 * Cheap — just reads settings, no network call.
 */
export async function isHostingerMailConfigured(): Promise<boolean> {
  const token = await getSetting("HOSTINGER_MAIL_TOKEN");
  const mailboxId = await getSetting("HOSTINGER_MAILBOX_ID");
  return !!(token && mailboxId);
}

/**
 * Send an email via Hostinger Mail API.
 *
 * Returns ok=true on HTTP 2xx, ok=false otherwise.
 * Response body is included for debugging (Hostinger returns error JSON
 * with a `message` field when something is wrong).
 */
export async function sendEmailViaHostinger(input: SendEmailInput): Promise<SendEmailResult> {
  const token = await getSetting("HOSTINGER_MAIL_TOKEN");
  const mailboxId = await getSetting("HOSTINGER_MAILBOX_ID");
  const displayName =
    input.displayName ||
    (await getSetting("HOSTINGER_MAIL_DISPLAY_NAME")) ||
    "Guruvayur Dham";

  if (!token || !mailboxId) {
    return {
      ok: false,
      method: "none",
      message: "HOSTINGER_MAIL_TOKEN or HOSTINGER_MAILBOX_ID not set",
    };
  }

  const toArray = Array.isArray(input.to) ? input.to : [input.to];

  // V1SendRequest body — see V1SendRequest.md in the PHP SDK.
  const body: Record<string, unknown> = {
    to: toArray,
    subject: input.subject,
    displayName,
  };
  if (input.text) body.text = input.text;
  if (input.html) body.html = input.html;
  if (input.cc && input.cc.length) body.cc = input.cc;
  if (input.bcc && input.bcc.length) body.bcc = input.bcc;

  const url = `${HOSTINGER_MAIL_BASE}/api/v1/mailboxes/${mailboxId}/send`;

  try {
    const res = await withRetry(
      () =>
        fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }),
      { maxRetries: 2, circuitBreakerKey: "hostinger-mail" },
    );

    // Hostinger returns 204 (No Content) on success. Read body only if present
    // so we don't crash on empty stream.
    let responseText = "";
    try {
      responseText = await res.text();
    } catch {
      // body stream already consumed or empty — ignore
    }

    if (res.ok) {
      return {
        ok: true,
        method: "hostinger-mail",
        message: `Sent (${res.status})`,
        responseStatus: res.status,
        responseBody: responseText || "(empty)",
      };
    }

    return {
      ok: false,
      method: "hostinger-mail",
      message: `HTTP ${res.status}: ${responseText.slice(0, 500)}`,
      responseStatus: res.status,
      responseBody: responseText,
    };
  } catch (e: any) {
    return {
      ok: false,
      method: "hostinger-mail",
      message: `Network error: ${e?.message || String(e)}`,
    };
  }
}

/**
 * List mailboxes the current token has access to.
 * Calls GET /api/v1/me → returns array of { resourceId, address }.
 * Useful for the Admin → Settings panel "Find my mailbox ID" lookup.
 */
export async function listHostingerMailboxes(): Promise<{
  ok: boolean;
  mailboxes?: Array<{ resourceId: string; address: string }>;
  error?: string;
}> {
  const token = await getSetting("HOSTINGER_MAIL_TOKEN");
  if (!token) {
    return { ok: false, error: "HOSTINGER_MAIL_TOKEN not set" };
  }

  try {
    const res = await fetch(`${HOSTINGER_MAIL_BASE}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${txt.slice(0, 300)}` };
    }
    const json = await res.json();
    // V1MeResourceData shape: { data: { mailboxes: [{ resourceId, address }, ...] } }
    // (the actual nested path is `json.data.mailboxes` per the SDK model)
    const mailboxes = (json?.data?.mailboxes || []) as Array<{
      resourceId: string;
      address: string;
    }>;
    return { ok: true, mailboxes };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * HTML-escape helper — used by callers that build plain-text bodies and want
 * to safely render them as HTML (no stored XSS in mail client).
 */
export function escapeHtmlForEmail(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
