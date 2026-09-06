"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MessageCircle, Settings, User, CreditCard, ChevronDown, BookOpen, MapPin, Calendar } from "lucide-react";
import { NAV_ITEMS, SITE, waLink } from "@/lib/site-data";
import { SEO_PAGES, getSEOPagesByCategory, ALL_SEO_PAGES } from "@/lib/seo-pages";
import { useHashRoute, isRouteActive } from "@/lib/router";
import { useContent } from "@/lib/use-cms";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/site/ThemeToggle";
import LanguageSelector from "@/components/site/LanguageSelector";
import { useI18n } from "@/lib/i18n/context";

export default function Navbar() {
  const { path, navigate } = useHashRoute();
  const { t } = useI18n();
  const { get } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);

  // Brand info from CMS (with hardcoded fallbacks)
  const brandName = get("site.name", "Guruvayur Dham");
  const brandTagline = get("footer.tagline", "Luxury Pilgrim Stay");
  const phoneRaw = get("contact.phoneRaw", SITE.phoneRaw);

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
              {brandName}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-champagne/70">
              {brandTagline}
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
                  {t(`nav.${item.label.toLowerCase()}`) || item.label}
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
          {/* Guides dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setGuidesOpen(true)}
            onMouseLeave={() => setGuidesOpen(false)}
          >
            <button
              onClick={() => setGuidesOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ivory/70 transition-colors hover:text-ivory"
            >
              <BookOpen className="h-3.5 w-3.5" /> Guides
              <ChevronDown className={cn("h-3 w-3 transition-transform", guidesOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {guidesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-full mt-1 w-80 max-h-[80vh] overflow-y-auto rounded-2xl border border-champagne/15 bg-ink-card p-3 shadow-luxe-lg"
                >
                  {/* Festivals */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <Calendar className="h-3 w-3" /> Festivals
                  </p>
                  {getSEOPagesByCategory("festivals").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                  {/* Hotels Near */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <MapPin className="h-3 w-3" /> Hotels Near
                  </p>
                  {getSEOPagesByCategory("hotels-near").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                  {/* Darshan Timings */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <BookOpen className="h-3 w-3" /> Darshan Timings
                  </p>
                  {getSEOPagesByCategory("darshan-timings").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                  {/* How to Reach */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <MapPin className="h-3 w-3" /> How to Reach
                  </p>
                  {getSEOPagesByCategory("how-to-reach").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                  {/* Pooja Guides */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <Calendar className="h-3 w-3" /> Pooja Guides
                  </p>
                  {getSEOPagesByCategory("pooja-guides").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                  {/* Travel Guides */}
                  <p className="flex items-center gap-1.5 px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
                    <BookOpen className="h-3 w-3" /> Travel Guides
                  </p>
                  {getSEOPagesByCategory("travel-guides").map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => go(p.slug)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                    >
                      {p.navLabel}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
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
            href={`tel:${phoneRaw}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne transition-colors hover:border-champagne/50 hover:bg-champagne/5"
            aria-label="Call us"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            onClick={() => go("/book")}
            className="rounded-full border border-champagne/30 bg-champagne/10 px-4 py-2.5 text-sm font-semibold text-champagne transition-all hover:bg-champagne/20"
          >
            {t("nav.instantBook") || "Instant Book"}
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
                      {t(`nav.${item.label.toLowerCase()}`) || item.label}
                    </button>
                  </li>
                );
              })}
              {/* Guides — mobile accordion */}
              <li className="mt-2 border-t border-champagne/10 pt-2">
                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-champagne/60">Guides</p>
                {ALL_SEO_PAGES.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => go(p.slug)}
                    className="block w-full rounded-lg px-4 py-2 text-left text-sm text-ivory/60 transition-colors hover:bg-champagne/5 hover:text-champagne"
                  >
                    {p.navLabel}
                  </button>
                ))}
              </li>
              <li className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-champagne/20 px-4 py-3 text-sm font-semibold text-champagne"
                >
                  <Phone className="h-4 w-4" /> {t("cta.call") || "Call"}
                </a>
                <button
                  onClick={() => go("/book")}
                  className="btn-luxe"
                >
                  <CreditCard className="h-4 w-4" /> {t("nav.instantBook") || "Instant Book"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/login")}
                  className="mt-2 block w-full rounded-xl border border-champagne/15 px-4 py-3 text-left text-sm font-medium text-champagne/80 hover:bg-champagne/5"
                >
                  <User className="mr-2 inline h-4 w-4" /> {t("nav.login") || "Guest Login"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => go("/admin")}
                  className="block w-full rounded-xl border border-champagne/15 px-4 py-3 text-left text-sm font-medium text-champagne/80 hover:bg-champagne/5"
                >
                  <Settings className="mr-2 inline h-4 w-4" /> {t("nav.admin") || "Admin Dashboard"}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
