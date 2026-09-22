"use client";

import { motion } from "framer-motion";
import { Wrench, Phone, MessageCircle } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { SITE, waLink } from "@/lib/site-data";
import { GoldFoilText } from "@/components/site/visuals";

/**
 * MaintenancePage — shown to guests when MAINTENANCE_MODE feature flag is on.
 * Admin routes (/admin/*, /login, /cms, /settings) still work normally.
 */
export default function MaintenancePage() {
  const { navigate } = useHashRoute();

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full border border-champagne/20 bg-champagne/5"
        >
          <Wrench className="h-10 w-10 text-champagne animate-pulse" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif text-4xl leading-tight text-ivory"
        >
          We'll Be Back<br />
          <GoldFoilText>Shortly</GoldFoilText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-sm leading-relaxed text-ivory/60"
        >
          Guruvayur Dham is undergoing scheduled maintenance to serve you better.
          We'll be back online shortly. For urgent bookings, please call or
          WhatsApp us directly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex flex-col gap-3"
        >
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="btn-brand flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            {SITE.phone}
          </a>
          <a
            href={waLink("Namaskaram! I'd like to book a room at Guruvayur Dham. The website seems to be down for maintenance. Can you help?")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-brand flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-xs text-ivory/30"
        >
          {SITE.name} · {SITE.shortAddress}
        </motion.p>
      </div>
    </div>
  );
}
