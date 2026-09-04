"use client";

import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Clock, BedDouble } from "lucide-react";
import { SITE, NAV_ITEMS, waLink } from "@/lib/site-data";
import { useHashRoute } from "@/lib/router";
import { GoldFoilText, MandalaDivider } from "./visuals";

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
            <p className="section-eyebrow">Begin Your Sacred Journey</p>
            <h3 className="mt-5 section-title">
              Ready for{" "}
              <GoldFoilText>Divine Comfort</GoldFoilText>,<br />
              2 Minutes from the Temple?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-base text-ivory/70">
              Book your room on WhatsApp in 30 seconds. Real-time availability, instant
              confirmation, and zero booking fee.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={waLink("Namaskaram! I'd like to book a luxury room at Guruvayur Dham. Please share availability.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-luxe"
              >
                <MessageCircle className="h-5 w-5" /> Book on WhatsApp
              </a>
              <a href={`tel:${SITE.phoneRaw}`} className="btn-ghost-luxe">
                <Phone className="h-5 w-5" /> {SITE.phone}
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
            <span className="grid h-11 w-11 place-items-center rounded-full border border-champagne/30 bg-ink-card">
              <span className="font-serif text-lg text-gold-foil">ॐ</span>
            </span>
            <div>
              <p className="font-serif text-xl font-medium text-ivory">{SITE.name}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
                {SITE.tagline}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-ivory/60">
            A boutique pilgrim home just 200 metres from Guruvayur Temple's East Nada
            gate. Cinematic dark-luxe rooms, honest pricing, and warm service for every
            devotee who walks through our doors.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Facebook, href: SITE.socials.facebook, label: "Facebook" },
              { icon: Instagram, href: SITE.socials.instagram, label: "Instagram" },
              { icon: Youtube, href: SITE.socials.youtube, label: "YouTube" },
              { icon: Twitter, href: SITE.socials.twitter, label: "Twitter" },
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
          <h3 className="font-serif text-lg text-champagne">Quick Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_ITEMS.map((l) => (
              <li key={l.route}>
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

        {/* Services */}
        <div>
          <h3 className="font-serif text-lg text-champagne">Our Services</h3>
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
          <h3 className="font-serif text-lg text-champagne">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">{SITE.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <a href={`tel:${SITE.phoneRaw}`} className="text-ivory/60 hover:text-champagne">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <a href={`mailto:${SITE.email}`} className="text-ivory/60 hover:text-champagne">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">
                Check-in: {SITE.checkIn} · Check-out: {SITE.checkOut}
              </span>
            </li>
            <li className="flex gap-3">
              <BedDouble className="mt-0.5 h-4 w-4 flex-shrink-0 text-champagne/80" />
              <span className="text-ivory/60">
                {SITE.totalRooms} rooms · {SITE.distanceToTemple}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-champagne/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ivory/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Crafted with devotion.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/privacy")} className="hover:text-champagne">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-champagne">Terms of Service</button>
            <button onClick={() => navigate("/faq")} className="hover:text-champagne">FAQ</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
