"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { SITE, waLink } from "@/lib/site-data";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Floating WhatsApp — desktop & mobile */}
      <motion.a
        href={waLink("Namaskaram! I'd like to enquire about rooms at Guruvayur Dham.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
        className="fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-warm-lg animate-pulse-ring sm:bottom-6 lg:right-6"
      >
        <MessageCircle className="h-7 w-7" fill="white" stroke="#25D366" strokeWidth={1.5} />
      </motion.a>

      {/* Scroll to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-20 z-50 hidden h-12 w-12 place-items-center rounded-full border border-border bg-card text-maroon shadow-warm transition-colors hover:bg-muted sm:bottom-6 lg:grid"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-card/95 backdrop-blur-md sm:hidden">
        <a
          href={`tel:${SITE.phoneRaw}`}
          className="flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold text-maroon"
        >
          <Phone className="h-5 w-5" />
          Call
        </a>
        <a
          href={waLink("Namaskaram! I'd like to book a room at Guruvayur Dham.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 border-x border-border py-3 text-xs font-semibold text-[#25D366]"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
        <a
          href="#contact"
          className="flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold text-saffron-dark"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-saffron text-[10px] text-white">
            ✦
          </span>
          Book Now
        </a>
      </div>
    </>
  );
}
