"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Copy, Check } from "lucide-react";
import { useContent } from "@/lib/use-cms";
import { useHashRoute } from "@/lib/router";
import { getFeatureFlag } from "@/lib/settings";
import { useAnalytics } from "@/lib/use-analytics";
import { toast } from "sonner";

/**
 * First-Visit Welcome Popup
 *
 * Shows a welcome offer popup on the user's FIRST browser visit (localStorage
 * flag, ever). Reveals a coupon code (default: WELCOME10) the user can copy
 * and paste at checkout.
 *
 * TRIGGERS:
 *   - First browser visit (no `gvd_welcome_seen` localStorage flag)
 *   - Feature flag FIRST_VISIT_POPUP is enabled
 *   - 3-second delay (so user sees content first)
 *
 * SUPPRESSED ON:
 *   - /admin/* (staff logged in, doesn't need welcome offer)
 *   - /login (mid-auth)
 *
 * ANALYTICS:
 *   - POPUP_SHOWN { popupType: "welcome" }
 *   - POPUP_DISMISSED { popupType: "welcome", action: "close" | "maybe_later" }
 *   - POPUP_CTA_CLICKED { popupType: "welcome", cta: "copy_code" | "book_now" }
 *
 * CMS-EDITABLE:
 *   - welcomePopup.headline (default: "Namaste, pilgrim!")
 *   - welcomePopup.body (default: see below)
 *   - welcomePopup.couponCode (default: "WELCOME10")
 *   - welcomePopup.cta (default: "Book My Stay")
 *   - welcomePopup.delayMs (default: 3000)
 */
const POPUP_TYPE = "welcome";
const STORAGE_KEY = "gvd_welcome_seen";

export default function FirstVisitWelcomePopup() {
  const { get } = useContent();
  const { navigate } = useHashRoute();
  const { trackEvent } = useAnalytics();
  const { path } = useHashRoute();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't show on admin/login routes
    if (path.startsWith("/admin") || path === "/login") return;

    getFeatureFlag("FIRST_VISIT_POPUP").then(setEnabled);

    // Only show on first browser visit (localStorage flag, ever)
    if (localStorage.getItem(STORAGE_KEY)) return;

    const delayMs = parseInt(get("welcomePopup.delayMs", "3000"));
    const timer = setTimeout(() => {
      setShow(true);
      // Mark as seen IMMEDIATELY when popup appears (so we don't re-show
      // on next page navigation within the same session)
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      trackEvent("POPUP_SHOWN", { popupType: POPUP_TYPE });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [path, get, trackEvent]);

  if (enabled === null) return null;
  if (!enabled || !show) return null;

  const couponCode = get("welcomePopup.couponCode", "WELCOME10");
  const headline = get("welcomePopup.headline", "Namaste, pilgrim! 🙏");
  const body = get(
    "welcomePopup.body",
    "Welcome to Guruvayur Dham. Use the code below for 10% off your first 2-night stay. Walk to Mata Pathwari Mandir, drive 3 km to Krishna Janmabhoomi, 15+ cinematic AC rooms.",
  );
  const ctaLabel = get("welcomePopup.cta", "Book My Stay");

  const dismiss = (action: "close" | "maybe_later" = "close") => {
    setShow(false);
    trackEvent("POPUP_DISMISSED", { popupType: POPUP_TYPE, action });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      trackEvent("POPUP_CTA_CLICKED", { popupType: POPUP_TYPE, cta: "copy_code" });
      toast.success(`Code ${couponCode} copied! Apply at checkout.`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available (older browser / insecure context)
      toast.error("Couldn't copy — please write down the code manually.");
    }
  };

  const handleBookNow = () => {
    trackEvent("POPUP_CTA_CLICKED", { popupType: POPUP_TYPE, cta: "book_now" });
    dismiss("close");
    navigate("/book");
  };

  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => dismiss("close")}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-champagne/20 bg-gradient-to-b from-ink-card to-ink shadow-luxe-lg"
          >
            {/* Decorative diya */}
            <div className="pointer-events-none absolute -right-12 -top-12 select-none font-serif text-[12rem] leading-none text-champagne/[0.04]">
              🪔
            </div>

            {/* Close button */}
            <button
              onClick={() => dismiss("close")}
              aria-label="Close popup"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-champagne/20 bg-ink/80 text-ivory backdrop-blur-md transition-colors hover:bg-ink/95"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-champagne" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-champagne/80">
                  First-Visit Offer · One Time Only
                </span>
              </div>

              <h3 className="mt-3 font-serif text-3xl text-ivory">{headline}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/70">{body}</p>

              {/* Coupon code reveal */}
              <div className="mt-5 rounded-2xl border border-dashed border-champagne/40 bg-champagne/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-champagne/70">
                  Your exclusive code
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold text-gold-foil">{couponCode}</span>
                  <button
                    onClick={copyCode}
                    aria-label="Copy coupon code"
                    className="grid h-8 w-8 place-items-center rounded-full border border-champagne/30 text-champagne transition-colors hover:bg-champagne/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-ivory/50">
                  10% off · max ₹500 discount · min 2-night stay · expires Dec 31, 2026
                </p>
              </div>

              {/* CTAs */}
              <button
                onClick={handleBookNow}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-champagne px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-champagne-bright"
              >
                {ctaLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => dismiss("maybe_later")}
                className="mt-2 w-full text-center text-[11px] text-ivory/40 hover:text-ivory/60"
              >
                Maybe later · code is saved in your account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
