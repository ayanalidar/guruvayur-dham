"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Utensils, Radio, BedDouble, Flame, RefreshCw, Wifi, WifiOff,
  TrendingUp,
} from "lucide-react";
import { useRealtime } from "@/lib/use-realtime";
import { cn } from "@/lib/utils";

interface LiveEvent {
  id: string;
  event: string;
  data: any;
  timestamp: Date;
}

const EVENT_META: Record<string, { icon: any; color: string; label: (data: any) => string }> = {
  "booking:new": {
    icon: CalendarDays,
    color: "text-green-300 bg-green-500/15",
    label: (d) => `New booking ${d.reference} — ${d.guestName} · ${d.roomName} · ₹${d.amount}`,
  },
  "booking:cancelled": {
    icon: CalendarDays,
    color: "text-red-300 bg-red-500/15",
    label: (d) => `Booking cancelled ${d.reference} — ${d.guestName}`,
  },
  "sync:new": {
    icon: Radio,
    color: "text-blue-300 bg-blue-500/15",
    label: (d) => `Channel sync: ${d.channel} — ${d.action} (${d.status})`,
  },
  "kitchen:order:new": {
    icon: Utensils,
    color: "text-yellow-300 bg-yellow-500/15",
    label: (d) => `Kitchen order ${d.reference} — Room ${d.roomNumber} · ₹${d.total}`,
  },
  "kitchen:order:update": {
    icon: Utensils,
    color: "text-orange-300 bg-orange-500/15",
    label: (d) => `Order ${d.reference} → ${d.status}`,
  },
  "housekeeping:update": {
    icon: BedDouble,
    color: "text-purple-300 bg-purple-500/15",
    label: (d) => `Room ${d.roomNumber} → ${d.status}`,
  },
  "pooja:update": {
    icon: Flame,
    color: "text-saffron bg-saffron/15",
    label: (d) => `Pooja ${d.reference} → ${d.status}`,
  },
};

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const { connected, lastEvent } = useRealtime([
    "booking:new",
    "booking:cancelled",
    "sync:new",
    "kitchen:order:new",
    "kitchen:order:update",
    "housekeeping:update",
    "pooja:update",
  ]);
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastEvent) return;
    // Dedup — same event+reference shouldn't be added twice
    const sig = `${lastEvent.event}:${lastEvent.data?.reference || lastEvent.data?.roomNumber || JSON.stringify(lastEvent.data).slice(0, 50)}`;
    if (sig === lastEventRef.current) return;
    lastEventRef.current = sig;

    const newEvent = {
      id: Math.random().toString(36).slice(2),
      event: lastEvent.event,
      data: lastEvent.data,
      timestamp: new Date(),
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents((prev) => [newEvent, ...prev].slice(0, 20));
  }, [lastEvent]);

  return (
    <div className="rounded-xl border border-champagne/15 bg-ink/50 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg text-ivory">
          <TrendingUp className="h-5 w-5 text-champagne" /> Live Activity Feed
        </h3>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
          connected ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"
        )}>
          {connected ? <><Wifi className="h-3 w-3" /> Live</> : <><WifiOff className="h-3 w-3" /> Disconnected</>}
        </span>
      </div>

      <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto scroll-smooth-dark">
        <AnimatePresence>
          {events.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center text-sm text-ivory/50">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin opacity-50" />
              Waiting for live events…<br />
              <span className="text-xs">New bookings, kitchen orders, and channel syncs will appear here in real-time.</span>
            </motion.div>
          )}
          {events.map((e) => {
            const meta = EVENT_META[e.event] || { icon: Radio, color: "text-ivory bg-ink", label: (d: any) => `${e.event}: ${JSON.stringify(d).slice(0, 80)}` };
            const Icon = meta.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 rounded-lg border border-champagne/10 bg-ink/30 p-3"
              >
                <div className={cn("grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg", meta.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ivory">{meta.label(e.data)}</p>
                  <p className="text-[10px] text-ivory/40">{e.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
