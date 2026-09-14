"use client";

import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Clock, BedDouble, CreditCard } from "lucide-react";
import { SITE, NAV_ITEMS, waLink } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { useContent } from "@/lib/use-cms";
import { GoldFoilText, MandalaDivider } from "./visuals";
import { useI18n } from "@/lib/i18n/context";

const serviceLinks = [
  { label: "AC Rooms", route: "/rooms" },
  { label: "Non-AC Rooms", route: "/rooms" },
  { label: "Family Suite", route: "/rooms" },
  { label: "360° Virtual Tour", route: "/tour" },
  { label: "Write a Review", route: "/review" },
  { label: "Influencer Portal", route: "/influencer" },
  { label: "Palpayasam Booking", route: "/pooja" },
  { label: "Thulabharam", route: "/pooja" },
  { label: "Choroonu Ceremony", route: "/pooja" },
];

export default function Footer() {
  const { navigate } = useHashRoute();
  const { t } = useI18n();
  const { get } = useContent();

  // All footer content from CMS with hardcoded fallbacks
  const brandName = get("site.name", SITE.name);
  const tagline = get("site.tagline", SITE.tagline);
  const footerTagline = get("footer.tagline", "Luxury Pilgrim Stay");
  const phone = get("contact.phone", SITE.phone);
  const phoneRaw = get("contact.phoneRaw", SITE.phoneRaw);
  const whatsapp = get("contact.whatsapp", SITE.whatsapp);
  const email = get("contact.email", SITE.email);
  const address = get("site.address", SITE.address);
  const checkIn = get("contact.checkIn", SITE.checkIn);
  const checkOut = get("contact.checkOut", SITE.checkOut);
  const totalRooms = get("site.totalRooms", String(SITE.totalRooms));
  const distanceToTemple = get("site.distanceToTemple", SITE.distanceToTemple);
  const ctaHeadline = get("footer.ctaHeadline", "Ready for Divine Comfort, 2 Minutes from the Temple?");
  const ctaSubtitle = get("footer.ctaSubtitle", "Book your room on WhatsApp in 30 seconds. Real-time availability, instant confirmation, dynamic pricing, and zero booking fee.");
  const socialsFacebook = get("footer.socials.facebook", SITE.socials.facebook);
  const socialsInstagram = get("footer.socials.instagram", SITE.socials.instagram);
  const socialsYoutube = get("footer.socials.youtube", SITE.socials.youtube);
  const socialsTwitter = get("footer.socials.twitter", SITE.socials.twitter);
  const madeByText = get("footer.madeBy", "Made And Maintained By:");
  const madeByLink = get("footer.madeByLink", "GuardianX");

  // WhatsApp helper using CMS-stored whatsapp number
  const wa = (msg: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

  return (
    <footer className="relative overflow-hidden bg-ink-soft text-ivory">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/40 to-transparent" />

      {/* Big CTA banner */}
      <div className="container-x py-16">
        <div className="relative overflow-hidden rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center shadow-luxe-lg sm:p-14">
          {/* Background mandala */}
          <div className="pointer-events-none absolute -right-20 -top-20 select-none font-serif text-[14rem] leading-none text-champagne/[0.04]">
            ॐ
          </div>
          <div className="pointer-events-none absolute -bottom-20 -left-20 select-none font-serif text-[14rem] leading-none text-champagne/[0.04]">
            ✦
          </div>

          <div className="relative">
            <p className="section-eyebrow">{t("footer.beginJourney") || "Begin Your Sacred Journey"}</p>
            <h3 className="mt-5 section-title">
              {ctaHeadline}
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-ivory/70">
              {ctaSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/book")}
                className="btn-luxe"
              >
                <CreditCard className="h-5 w-5" /> {t("nav.instantBook") || "Instant Book"}
              </button>
              <a href={`tel:${phoneRaw}`} className="btn-ghost-luxe">
                <Phone className="h-5 w-5" /> {phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      <MandalaDivider className="!py-4 opacity-50" />

      {/* Main footer grid */}
      <div className="container-x grid gap-10 pb-12 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-footer.png"
              alt={brandName}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-serif text-xl font-medium text-ivory">{brandName}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
                {footerTagline}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ivory/60">
            {tagline}. A boutique pilgrim home just 200 metres from the temple's East Nada
            gate. Cinematic dark-luxe rooms, honest pricing, and warm service for every
            devotee who walks through our doors.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Facebook, href: socialsFacebook, label: "Facebook" },
              { icon: Instagram, href: socialsInstagram, label: "Instagram" },
              { icon: Youtube, href: socialsYoutube, label: "YouTube" },
              { icon: Twitter, href: socialsTwitter, label: "Twitter" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-champagne/15 text-champagne/70 transition-all hover:border-champagne/50 hover:text-champagne"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-serif text-lg text-champagne">{t('footer.quickLinks') || "Quick Links"}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_ITEMS.map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="text-ivory/60 transition-colors hover:text-champagne"
                >
                  {t(`nav.${l.label.toLowerCase()}`) || l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-serif text-lg text-champagne">{t('footer.services') || "Our Services"}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {serviceLinks.map((l, i) => (
              <li key={i}>
                <button
                  onClick={() => navigate(l.route)}
                  className="text-ivory/60 transition-colors hover:text-champagne"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-lg text-champagne">{t('footer.reachUs') || "Reach Us"}</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">{address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <a href={`tel:${phoneRaw}`} className="text-ivory/60 hover:text-champagne">
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <a href={`mailto:${email}`} className="text-ivory/60 hover:text-champagne">
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">
                {t('common.checkIn') || "Check-in"}: {checkIn} · {t('common.checkOut') || "Check-out"}: {checkOut}
              </span>
            </li>
            <li className="flex gap-3">
              <BedDouble className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">
                {totalRooms} {t('hero.rooms') || "rooms"} · {distanceToTemple}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-champagne/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ivory/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {brandName}. {t('footer.craftedWith') || "Crafted with devotion"}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button onClick={() => navigate("/privacy")} className="hover:text-champagne">{t('footer.privacyPolicy') || "Privacy Policy"}</button>
            <button onClick={() => navigate("/terms")} className="hover:text-champagne">{t('footer.terms') || "Terms of Service"}</button>
            <button onClick={() => navigate("/policies")} className="hover:text-champagne">{t('footer.policies') || "Booking Policies"}</button>
            <button onClick={() => navigate("/faq")} className="hover:text-champagne">{t('footer.faq') || "FAQ"}</button>
          </div>
        </div>
        <div className="container-x pb-4 text-center">
          <p className="text-[10px] text-ivory/30">
            {madeByText}{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-champagne/50 transition-colors hover:text-champagne"
            >
              {madeByLink}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
