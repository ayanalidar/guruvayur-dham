"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { NAV_ITEMS, SITE, waLink } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // active-section detection
      const sections = NAV_ITEMS.map((n) => n.href.replace("#", ""));
      let current = "#home";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          current = "#" + id;
          break;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav border-b border-border shadow-warm" : "bg-transparent"
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between lg:h-20">
        {/* Logo */}
        <button
          onClick={() => handleNav("#home")}
          className="flex items-center gap-2.5 text-left"
          aria-label="Guruvayur Dham home"
        >
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-saffron text-white shadow-warm">
            <span className="font-serif text-lg leading-none">গু</span>
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "font-serif text-xl font-bold transition-colors",
                scrolled ? "text-maroon dark:text-cream" : "text-white"
              )}
            >
              Guruvayur Dham
            </span>
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-colors",
                scrolled ? "text-muted-foreground" : "text-cream/80"
              )}
            >
              Stay · Pooja · Blessing
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleNav(item.href)}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  scrolled
                    ? "text-foreground/80 hover:text-maroon"
                    : "text-cream/90 hover:text-white",
                  active === item.href &&
                    (scrolled ? "text-maroon" : "text-white")
                )}
              >
                {item.label}
                {active === item.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-saffron"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-maroon transition-colors hover:bg-muted"
            aria-label="Call us"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={waLink(
              "Namaskaram! I'd like to enquire about room availability at Guruvayur Dham."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2.5 text-sm font-semibold text-white shadow-warm transition-all hover:bg-saffron-dark hover:shadow-warm-lg active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            Book Now
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full lg:hidden",
            scrolled ? "text-maroon" : "text-white"
          )}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden glass-nav border-t border-border lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNav(item.href)}
                    className={cn(
                      "block w-full rounded-xl px-4 py-3 text-left text-base font-medium transition-colors",
                      active === item.href
                        ? "bg-saffron/10 text-maroon"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-maroon"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={waLink(
                    "Namaskaram! I'd like to book a room at Guruvayur Dham."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron px-4 py-3 text-sm font-semibold text-white"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
