"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_KEY = "gd-cookie-consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-[70] p-4"
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-champagne/20 bg-ink-card/95 p-5 shadow-luxe-lg backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-champagne/10">
              <Cookie className="h-6 w-6 text-champagne" />
            </span>
            <div className="flex-1">
              <p className="font-serif text-base text-ivory">
                We use cookies to enhance your experience
              </p>
              <p className="mt-1 text-xs text-ivory/60">
                We use cookies for essential functionality (booking, authentication) and analytics (understanding how you use our site). By clicking "Accept All", you consent to our use of cookies in accordance with the DPDP Act, 2023.{" "}
                <button onClick={() => setExpanded(!expanded)} className="text-champagne underline">
                  {expanded ? "Show less" : "Learn more"}
                </button>
              </p>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="space-y-2 rounded-lg border border-champagne/10 bg-ink/50 p-3 text-xs text-ivory/60">
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-300" />
                        <span><strong className="text-ivory/80">Essential cookies</strong> — required for booking, login, and security. Always active.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-yellow-300" />
                        <span><strong className="text-ivory/80">Analytics cookies</strong> — help us understand visitor behavior to improve our service.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-blue-300" />
                        <span><strong className="text-ivory/80">Marketing cookies</strong> — used to show relevant ads and track campaign performance.</span>
                      </div>
                      <p className="mt-2 text-[10px] text-ivory/40">
                        You can withdraw consent at any time by clearing your browser cookies. See our Privacy Policy for details on data collection, processing, and your rights under the Digital Personal Data Protection Act, 2023.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => accept("all")} className="btn-luxe text-xs">
                  <Check className="h-3.5 w-3.5" /> Accept All
                </button>
                <button onClick={() => accept("essential")} className="rounded-full border border-champagne/20 px-4 py-2 text-xs font-semibold text-champagne transition-colors hover:bg-champagne/10">
                  Essential Only
                </button>
                <button onClick={() => { window.location.hash = "#/privacy"; }} className="rounded-full border border-champagne/10 px-4 py-2 text-xs text-ivory/50 hover:text-ivory">
                  Privacy Policy
                </button>
              </div>
            </div>
            <button onClick={() => accept("essential")} className="text-ivory/30 hover:text-ivory" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
