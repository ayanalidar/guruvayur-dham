"use client";

import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Clock, BedDouble } from "lucide-react";
import { SITE, NAV_ITEMS, waLink } from "@/lib/site-data";

const quickLinks = NAV_ITEMS;
const serviceLinks = [
  { label: "AC Rooms", href: "#rooms" },
  { label: "Non-AC Rooms", href: "#rooms" },
  { label: "Family Suite", href: "#rooms" },
  { label: "Palpayasam Booking", href: "#pooja" },
  { label: "Thulabharam", href: "#pooja" },
  { label: "Choroonu Ceremony", href: "#pooja" },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-maroon text-cream">
      {/* Decorative top border */}
      <div className="divider-dots opacity-30" />

      {/* Big CTA banner */}
      <div className="container-x -mt-px py-12">
        <div className="rounded-3xl bg-gradient-saffron p-8 text-center text-white shadow-warm-lg sm:p-12">
          <p className="font-serif text-3xl leading-tight sm:text-4xl">
            Ready for divine comfort, 2 minutes from the temple?
          </p>
          <p className="mx-auto mt-3 max-w-xl text-cream/90">
            Book your room on WhatsApp in 30 seconds. Real-time availability, instant
            confirmation, and zero booking fee.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waLink(
                "Namaskaram! I'd like to book a room at Guruvayur Dham. Please share availability."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-saffron-dark shadow-warm transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" /> Book on WhatsApp
            </a>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
            >
              <Phone className="h-5 w-5" /> {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-x grid gap-10 pb-12 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-gold font-serif text-lg text-maroon-dark">
              ॐ
            </span>
            <div>
              <p className="font-serif text-xl font-bold">{SITE.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-gold">
                {SITE.tagline}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream/80">
            A pilgrim-first temple stay just 200 metres from Guruvayur Temple's East Nada
            gate. Clean rooms, honest pricing, and warm service for every devotee who walks
            through our doors.
          </p>
          <div className="mt-4 flex gap-2">
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
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream transition-colors hover:bg-saffron hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-serif text-lg text-gold">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-cream/80 transition-colors hover:text-saffron-light"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-serif text-lg text-gold">Our Services</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceLinks.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  className="text-cream/80 transition-colors hover:text-saffron-light"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-lg text-gold">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-light" />
              <span className="text-cream/80">{SITE.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-light" />
              <a href={`tel:${SITE.phoneRaw}`} className="text-cream/80 hover:text-saffron-light">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-light" />
              <a href={`mailto:${SITE.email}`} className="text-cream/80 hover:text-saffron-light">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-light" />
              <span className="text-cream/80">
                Check-in: {SITE.checkIn} · Check-out: {SITE.checkOut}
              </span>
            </li>
            <li className="flex gap-3">
              <BedDouble className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-light" />
              <span className="text-cream/80">
                {SITE.totalRooms} rooms · {SITE.distanceToTemple}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-saffron-light">Privacy Policy</a>
            <a href="#terms" className="hover:text-saffron-light">Terms of Service</a>
            <a href="#faq" className="hover:text-saffron-light">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
