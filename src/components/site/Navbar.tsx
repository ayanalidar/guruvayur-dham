"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MessageCircle, Settings, User, CreditCard } from "lucide-react";
import { NAV_ITEMS, SITE, waLink } from "@/lib/site-data";
import { useHashRoute, isRouteActive } from "@/lib/router";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/site/ThemeToggle";
import LanguageSelector from "@/components/site/LanguageSelector";

export default function Navbar() {
  const { path, navigate } = useHashRoute();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navigate + close mobile menu in the same handler (avoids setState-in-effect)
  const go = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-nav py-2" : "bg-transparent py-4"
      )}
    >
      <nav className="container-x flex h-14 items-center justify-between lg:h-16">
        {/* Logo */}
        <button
          onClick={() => go("/")}
          className="group flex items-center gap-2.5"
          aria-label="Guruvayur Dham home"
        >
          <img
            src="/logo-nav.png"
            alt="Guruvayur Dham"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
          />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-medium tracking-wide text-ivory">
              Guruvayur Dham
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-champagne/70">
              Luxury Pilgrim Stay
            </span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(path, item.route);
            return (
              <li key={item.route}>
                <button
                  onClick={() => go(item.route)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "text-champagne"
                      : "text-ivory/70 hover:text-ivory"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-champagne/20 bg-champagne/5"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={() => go("/login")}
            className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:bg-champagne/5"
            aria-label="Login"
            title="Guest Login"
          >
            <User className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <LanguageSelector />
          <button
            onClick={() => go("/admin")}
            className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:bg-champagne/5"
            aria-label="Admin Dashboard"
            title="Admin Dashboard"
          >
            <Settings className="h-4 w-4" />
          </button>
          <a
            href={`tel:${SITE.phoneRaw}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:border-champagne/50 hover:bg-champagne/5"
            aria-label="Call us"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={() => go("/book")}
            className="rounded-full border border-champagne/30 bg-champagne/10 px-4 py-2.5 text-sm font-semibold text-champagne transition-all hover:bg-champagne/20"
          >
            Instant Book
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden glass-strong lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {NAV_ITEMS.map((item) => {
                const active = isRouteActive(path, item.route);
                return (
                  <li key={item.route}>
                    <button
                      onClick={() => go(item.route)}
                      className={cn(
                        "block w-full rounded-xl px-4 py-3 text-left text-base font-medium transition-colors",
                        active
                          ? "bg-champagne/10 text-champagne"
                          : "text-ivory/80 hover:bg-champagne/5"
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
              <li className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${SITE.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-champagne/20 px-4 py-3 text-sm font-semibold text-champagne"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <button
                  onClick={() => go("/book")}
                  className="btn-luxe"
                >
                  <CreditCard className="h-4 w-4" /> Instant Book
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/login")}
                  className="mt-2 block w-full rounded-xl border border-champagne/15 px-4 py-3 text-left text-sm font-medium text-champagne/80 hover:bg-champagne/5"
                >
                  <User className="mr-2 inline h-4 w-4" /> Guest Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/admin")}
                  className="block w-full rounded-xl border border-champagne/15 px-4 py-3 text-left text-sm font-medium text-champagne/80 hover:bg-champagne/5"
                >
                  <Settings className="mr-2 inline h-4 w-4" /> Admin Dashboard
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
