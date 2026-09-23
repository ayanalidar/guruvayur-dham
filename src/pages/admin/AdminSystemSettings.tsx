"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Shield, Activity, ToggleLeft, ToggleRight, RefreshCw,
  CreditCard, Bot, MessageSquare, Mail, Database, Zap, Image,
  CheckCircle, XCircle, AlertCircle, TestTube, Save, Bell,
  Server, HardDrive, Clock, Wifi, WifiOff, Wrench, Lock,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Setting {
  key: string; value: string | null; category: string;
  label: string | null; isSecret: boolean; isSet: boolean; updatedAt: string;
}
interface FeatureFlag {
  key: string; label: string; description: string | null;
  enabled: boolean; updatedAt: string;
}
interface HealthCheck {
  service: string; label: string; status: string;
  latency?: number; message: string; category: string;
}
interface AdminNotification {
  id: string; type: string; severity: string;
  title: string; message: string; createdAt: string; readBy: string[];
}

const INTEGRATION_ICONS: Record<string, any> = {
  RAZORPAY: CreditCard, GROQ: Bot, WHATSAPP: MessageSquare,
  SMTP: Mail, BLOB: Image, UPSTASH: Database, VAPID: Bell,
  GOOGLE: Shield, FACEBOOK: Shield, CRON: Clock, REALTIME: Wifi,
  HOSTINGER: Mail,
};

export default function SystemSettingsPage() {
  const { navigate } = useHashRoute();
  const [activeTab, setActiveTab] = useState<"integrations" | "health" | "flags" | "notifications">("integrations");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [testing, setTesting] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetch("/api/settings", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/feature-flags", { cache: "no-store" }).then(r => r.json()),
      ]);
      setSettings(s.settings || []);
      setFlags(s.flags || f.flags || []);
    } catch (e: any) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadHealth = useCallback(async () => {
    try {
      const r = await fetch("/api/health-check", { cache: "no-store" });
      const j = await r.json();
      setHealth(j.checks || []);
    } catch {
      toast.error("Health check failed");
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const r = await fetch("/api/admin-notifications", { cache: "no-store" });
      const j = await r.json();
      setNotifications(j.notifications || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === "health") loadHealth();
    if (activeTab === "notifications") loadNotifications();
  }, [activeTab, loadHealth, loadNotifications]);

  const saveSetting = async (key: string, value: string) => {
    const setting = settings.find(s => s.key === key);
    try {
      const r = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, isSecret: setting?.isSecret ?? true, category: setting?.category, label: setting?.label }),
      });
      if (r.ok) {
        toast.success(`${key} saved`);
        setEditingKey(null);
        setEditValue("");
        loadData();
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const testIntegration = async (service: string) => {
    setTesting(service);
    try {
      const r = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const j = await r.json();
      if (j.result?.status === "ok") toast.success(`${j.result.label}: ${j.result.message}`);
      else if (j.result?.status === "not_configured") toast.info(`${j.result.label}: not configured`);
      else toast.error(`${j.result?.label || service}: ${j.result?.message || "test failed"}`);
    } catch {
      toast.error("Test failed — network error");
    } finally {
      setTesting(null);
    }
  };

  /**
   * Send a real test email via Hostinger Mail API.
   * Prompts for a recipient address (default: the current staff's email if available).
   */
  const sendTestEmail = async () => {
    const to = window.prompt("Send a test email to:", "");
    if (!to) return; // user cancelled
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setTesting("hostinger-mail");
    try {
      const r = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.success(`✓ Test email sent to ${to}`);
      } else {
        toast.error(`Test email failed: ${j.error || "unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Network error: ${e?.message || "failed"}`);
    } finally {
      setTesting(null);
    }
  };

  /**
   * Lookup available mailboxes for the configured Hostinger Mail token.
   * Useful when the admin has a fresh token but doesn't know their mailboxResourceId.
   */
  const lookupMailboxes = async () => {
    setTesting("hostinger-mailboxes");
    try {
      const r = await fetch("/api/email/mailboxes");
      const j = await r.json();
      if (j.ok && j.mailboxes?.length > 0) {
        const lines = j.mailboxes.map((m: any) => `${m.resourceId}  →  ${m.address}`).join("\n");
        toast.success(`Found ${j.mailboxes.length} mailbox(es) — see console`);
        console.info("Hostinger Mail mailboxes for this token:\n", lines);
        // Also copy the first mailbox ID to clipboard for convenience
        const first = j.mailboxes[0];
        if (first?.resourceId) {
          try {
            await navigator.clipboard.writeText(first.resourceId);
            toast.info(`Copied first mailbox ID to clipboard: ${first.resourceId}`);
          } catch {}
        }
      } else if (j.ok && j.mailboxes?.length === 0) {
        toast.info("Token is valid but no mailboxes are accessible. Check the token's scope in hPanel.");
      } else {
        toast.error(`Lookup failed: ${j.error || "unknown error"}`);
      }
    } catch (e: any) {
      toast.error(`Network error: ${e?.message || "failed"}`);
    } finally {
      setTesting(null);
    }
  };

  const toggleFlag = async (key: string, enabled: boolean) => {
    try {
      const r = await fetch("/api/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: !enabled }),
      });
      if (r.ok) {
        toast.success(`${key} ${!enabled ? "enabled" : "disabled"}`);
        loadData();
      }
    } catch {}
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch("/api/admin-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadNotifications();
    } catch {}
  };

  const toggleMaintenance = async () => {
    const flag = flags.find(f => f.key === "MAINTENANCE_MODE");
    if (!flag) return;
    if (flag.enabled) {
      // Turning off — simple
      toggleFlag("MAINTENANCE_MODE", false);
    } else {
      // Turning on — confirm
      if (confirm("Enable maintenance mode? Guests will see a holding page. Admin still works.")) {
        toggleFlag("MAINTENANCE_MODE", true);
      }
    }
  };

  const grouped = settings.reduce((acc, s) => {
    const cat = s.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  return (
    <div className="animate-page-reveal min-h-screen bg-ink pb-20">
      <PageHeader
        eyebrow="Platform"
        icon={Settings}
        title={<>System <GoldFoilText>Settings</GoldFoilText></>}
        subtitle="Manage all integrations, feature flags, and system health from one place."
        crumbs={[{ label: "Admin", route: "/admin/hub" }, { label: "System Settings" }]}
      />

      <section className="bg-ink py-8">
        <div className="container-x max-w-6xl">
          {/* Tab bar */}
          <div className="mb-8 flex gap-2 rounded-full border border-champagne/15 bg-ink-card p-1.5">
            {[
              { id: "integrations", label: "Integrations", icon: Settings },
              { id: "health", label: "Health Check", icon: Activity },
              { id: "flags", label: "Feature Flags", icon: ToggleLeft },
              { id: "notifications", label: "Alerts", icon: Bell },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                  activeTab === t.id ? "bg-champagne text-ink" : "text-ivory/60 hover:text-ivory"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.id === "notifications" && notifications.filter(n => !n.readBy?.length).length > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                    {notifications.filter(n => !n.readBy?.length).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Maintenance mode banner */}
          {flags.find(f => f.key === "MAINTENANCE_MODE")?.enabled && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3">
              <Wrench className="h-5 w-5 text-yellow-300" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-200">Maintenance mode is ON</p>
                <p className="text-xs text-yellow-200/60">Guests see a holding page. Admin still works.</p>
              </div>
              <button onClick={toggleMaintenance} className="rounded-lg bg-yellow-500/20 px-4 py-1.5 text-xs font-semibold text-yellow-200 hover:bg-yellow-500/30">
                Turn off
              </button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="grid place-items-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-champagne" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* === INTEGRATIONS TAB === */}
                {activeTab === "integrations" && (
                  <div className="space-y-8">
                    {Object.entries(grouped).map(([category, items]) => (
                      <div key={category} className="rounded-2xl border border-champagne/15 bg-ink-card p-6">
                        <h3 className="mb-4 font-serif text-lg text-ivory">{category}</h3>
                        <div className="grid gap-4">
                          {items.map(s => {
                            const Icon = INTEGRATION_ICONS[s.key.split("_")[0]] || Settings;
                            return (
                              <div key={s.key} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink/50 p-4">
                                <div className="grid h-10 w-10 place-items-center rounded-lg bg-champagne/10">
                                  <Icon className="h-5 w-5 text-champagne" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-ivory">{s.label || s.key}</p>
                                    {s.isSet ? (
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                  </div>
                                  <p className="mt-0.5 font-mono text-xs text-ivory/40">
                                    {s.isSet ? (s.value || "••••") : "Not configured"}
                                  </p>
                                </div>
                                {editingKey === s.key ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type={s.isSecret ? "password" : "text"}
                                      value={editValue}
                                      onChange={e => setEditValue(e.target.value)}
                                      placeholder={s.isSecret ? "Enter value (hidden)" : "Enter value"}
                                      className="w-48 rounded-lg border border-champagne/20 bg-ink px-3 py-1.5 text-sm text-ivory"
                                      autoFocus
                                    />
                                    <button onClick={() => saveSetting(s.key, editValue)} className="rounded-lg bg-green-500/20 p-2 hover:bg-green-500/30">
                                      <Save className="h-4 w-4 text-green-300" />
                                    </button>
                                    <button onClick={() => { setEditingKey(null); setEditValue(""); }} className="rounded-lg bg-red-500/20 p-2 hover:bg-red-500/30">
                                      <XCircle className="h-4 w-4 text-red-300" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {s.key === "HOSTINGER_MAIL_TOKEN" && (
                                      <button
                                        onClick={sendTestEmail}
                                        disabled={testing === "hostinger-mail"}
                                        className="rounded-lg bg-champagne/15 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/25 disabled:opacity-50"
                                      >
                                        {testing === "hostinger-mail" ? "Sending…" : "Send Test"}
                                      </button>
                                    )}
                                    {s.key === "HOSTINGER_MAILBOX_ID" && (
                                      <button
                                        onClick={lookupMailboxes}
                                        disabled={testing === "hostinger-mailboxes"}
                                        className="rounded-lg bg-champagne/15 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/25 disabled:opacity-50"
                                      >
                                        {testing === "hostinger-mailboxes" ? "Looking up…" : "Find ID"}
                                      </button>
                                    )}
                                    {s.key.includes("RAZORPAY") || s.key.includes("GROQ") || s.key.includes("WHATSAPP") || s.key.includes("SMTP") || s.key.includes("UPSTASH") || s.key.includes("BLOB") ? (
                                      <button
                                        onClick={() => testIntegration(s.key.split("_")[0].toLowerCase())}
                                        disabled={testing === s.key.split("_")[0].toLowerCase()}
                                        className="rounded-lg bg-champagne/10 px-3 py-1.5 text-xs font-medium text-champagne hover:bg-champagne/20 disabled:opacity-50"
                                      >
                                        {testing === s.key.split("_")[0].toLowerCase() ? "Testing..." : "Test"}
                                      </button>
                                    ) : null}
                                    <button
                                      onClick={() => { setEditingKey(s.key); setEditValue(""); }}
                                      className="rounded-lg bg-champagne/10 px-3 py-1.5 text-xs font-medium text-champagne hover:bg-champagne/20"
                                    >
                                      {s.isSet ? "Update" : "Configure"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* === HEALTH CHECK TAB === */}
                {activeTab === "health" && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <p className="text-sm text-ivory/60">Real-time status of all integrations</p>
                      <button onClick={loadHealth} className="flex items-center gap-2 rounded-lg bg-champagne/10 px-4 py-2 text-sm text-champagne hover:bg-champagne/20">
                        <RefreshCw className="h-4 w-4" /> Refresh
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {health.length === 0 ? (
                        <div className="col-span-2 grid place-items-center py-12 text-ivory/40">
                          <Activity className="mb-2 h-8 w-8" />
                          Click "Refresh" to run health checks
                        </div>
                      ) : health.map(h => {
                        const Icon = INTEGRATION_ICONS[h.service.toUpperCase()] || Server;
                        const statusColor = h.status === "ok" ? "green" : h.status === "error" ? "red" : "yellow";
                        return (
                          <div key={h.service} className={cn(
                            "rounded-xl border p-4",
                            statusColor === "green" && "border-green-500/20 bg-green-500/5",
                            statusColor === "red" && "border-red-500/20 bg-red-500/5",
                            statusColor === "yellow" && "border-yellow-500/20 bg-yellow-500/5",
                          )}>
                            <div className="flex items-center gap-3">
                              <Icon className={cn("h-5 w-5", statusColor === "green" && "text-green-300", statusColor === "red" && "text-red-300", statusColor === "yellow" && "text-yellow-300")} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-ivory">{h.label}</p>
                                <p className="text-xs text-ivory/50">{h.message}</p>
                              </div>
                              {h.latency && <span className="text-xs text-ivory/40">{h.latency}ms</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* === FEATURE FLAGS TAB === */}
                {activeTab === "flags" && (
                  <div className="space-y-3">
                    {flags.map(f => (
                      <div key={f.key} className="flex items-center gap-4 rounded-xl border border-champagne/10 bg-ink-card p-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ivory">{f.label}</p>
                          {f.description && <p className="text-xs text-ivory/50">{f.description}</p>}
                        </div>
                        <button
                          onClick={() => f.key === "MAINTENANCE_MODE" ? toggleMaintenance() : toggleFlag(f.key, f.enabled)}
                          className={cn(
                            "relative h-7 w-12 rounded-full transition-colors",
                            f.enabled ? "bg-green-500" : "bg-ivory/20"
                          )}
                        >
                          <span className={cn(
                            "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                            f.enabled ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                        <span className={cn("text-xs font-semibold", f.enabled ? "text-green-300" : "text-ivory/40")}>
                          {f.enabled ? "ON" : "OFF"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* === NOTIFICATIONS TAB === */}
                {activeTab === "notifications" && (
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="grid place-items-center py-12 text-ivory/40">
                        <Bell className="mb-2 h-8 w-8" />
                        No alerts — all systems nominal
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={cn(
                        "rounded-xl border p-4",
                        n.severity === "CRITICAL" && "border-red-500/30 bg-red-500/5",
                        n.severity === "WARNING" && "border-yellow-500/30 bg-yellow-500/5",
                        n.severity === "INFO" && "border-blue-500/30 bg-blue-500/5",
                      )}>
                        <div className="flex items-start gap-3">
                          <AlertCircle className={cn("h-5 w-5 mt-0.5", n.severity === "CRITICAL" && "text-red-300", n.severity === "WARNING" && "text-yellow-300", n.severity === "INFO" && "text-blue-300")} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-ivory">{n.title}</p>
                            <p className="mt-1 text-xs text-ivory/60">{n.message}</p>
                            <p className="mt-1 text-[10px] text-ivory/30">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                          </div>
                          <button onClick={() => markNotificationRead(n.id)} className="text-xs text-champagne hover:underline">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
