"use client";

import { motion } from "framer-motion";
import { ChevronRight, MessageCircle, MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import { getSEOPage, getSEOPagesByCategory, type SEOPageCategory } from "@/lib/seo-pages";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, OmWatermark } from "@/components/site/visuals";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE, waLink } from "@/lib/site-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * SEOPage — template component that renders any SEO landing page
 * from the config in src/lib/seo-pages.ts.
 *
 * Features:
 *   - PageHeader with eyebrow, title, breadcrumbs
 *   - Hero section with background image
 *   - Intro section (main SEO content — multi-paragraph)
 *   - Content sections (heading + body paragraphs)
 *   - FAQ accordion (with FAQPage JSON-LD)
 *   - CTA section with booking buttons
 *   - JSON-LD structured data (Event / TouristAttraction / FAQPage)
 *
 * Usage: <SEOPage slug="janmashtami" />
 */
export default function SEOPage({ slug }: { slug: string }) {
  const { navigate } = useHashRoute();
  const page = getSEOPage(slug);

  if (!page) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-ink pt-20">
        <div className="text-center">
          <p className="font-serif text-4xl text-gold-foil">404</p>
          <p className="mt-2 text-ivory/60">Page not found</p>
          <button onClick={() => navigate("/")} className="btn-luxe mt-4">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Build JSON-LD based on page type
  let jsonLdData: object;
  const baseUrl = "https://www.guruvayurdham.com";

  if (page.jsonLdType === "Event") {
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: page.title,
      description: page.metaDescription,
      startDate: "2026-01-01", // approximate — festivals don't have exact confirmed dates
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: "Mathura",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mathura",
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
      },
      image: page.heroImage,
      organizer: { "@type": "Organization", name: "Guruvayur Dham" },
    };
  } else if (page.jsonLdType === "TouristAttraction") {
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: page.title,
      description: page.metaDescription,
      image: page.heroImage,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mathura",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      url: `${baseUrl}/#/${page.slug}`,
    };
  } else {
    jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
  }

  // Also inject FAQPage JSON-LD if the page has FAQs (in addition to the main schema)
  const faqJsonLd =
    page.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <div className="animate-page-reveal">
      {/* JSON-LD structured data for SEO */}
      <JsonLd id={`seo-${page.slug}`} data={jsonLdData} />
      {faqJsonLd && <JsonLd id={`seo-${page.slug}-faq`} data={faqJsonLd} />}

      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title.split(" — ")[0].split(" | ")[0]}
        subtitle={page.metaDescription}
        crumbs={[
          { label: "Home", route: "/" },
          { label: page.category === "festivals" ? "Festivals" : page.category === "hotels-near" ? "Hotels Near" : "Darshan Guide" },
          { label: page.navLabel },
        ]}
      />

      {/* Hero image */}
      <section className="relative h-[40vh] overflow-hidden bg-ink lg:h-[50vh]">
        <img
          src={page.heroImage}
          alt={page.title}
          className="h-full w-full object-cover photo-cinematic"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 container-x">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-2xl text-ivory sm:text-3xl lg:text-4xl"
          >
            {page.title.split(" — ")[0]}
          </motion.h1>
        </div>
      </section>

      {/* Main content */}
      <section className="relative overflow-hidden bg-ink py-16 lg:py-20">
        <OmWatermark className="right-[-6rem] top-10" size="18rem" />
        <div className="container-x relative">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Content (2/3 width) */}
            <div className="lg:col-span-2">
              {/* Intro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {page.intro.map((para, i) => (
                  <p
                    key={i}
                    className="mb-4 text-base leading-relaxed text-ivory/70 sm:text-lg"
                  >
                    {para}
                  </p>
                ))}
              </motion.div>

              {/* Content sections */}
              {page.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className="mt-10"
                >
                  <h2 className="font-serif text-2xl text-ivory sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-3 h-px w-16 bg-gradient-gold" />
                  {section.body.map((para, j) => (
                    <p
                      key={j}
                      className="mt-4 text-base leading-relaxed text-ivory/70"
                    >
                      {para}
                    </p>
                  ))}
                </motion.div>
              ))}

              {/* FAQ section */}
              {page.faqs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5 }}
                  className="mt-12"
                >
                  <h2 className="font-serif text-2xl text-ivory sm:text-3xl">
                    Frequently Asked Questions
                  </h2>
                  <div className="mt-3 h-px w-16 bg-gradient-gold" />
                  <Accordion type="single" collapsible className="mt-6 space-y-3">
                    {page.faqs.map((faq, i) => (
                      <AccordionItem
                        key={i}
                        value={`faq-${i}`}
                        className="overflow-hidden rounded-2xl border border-champagne/12 bg-ink-card px-5 shadow-luxe"
                      >
                        <AccordionTrigger className="text-left font-serif text-base text-ivory hover:no-underline sm:text-lg">
                          <span className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent text-xs font-bold text-champagne">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {faq.q}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pt-1 text-sm leading-relaxed text-ivory/70 sm:text-base">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}
            </div>

            {/* Sidebar (1/3 width) — sticky CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Booking CTA */}
                <div className="card-luxe p-6">
                  <h3 className="font-serif text-xl text-ivory">
                    {page.ctaHeadline}
                  </h3>
                  <p className="mt-2 text-sm text-ivory/60">
                    Clean AC rooms from ₹700/night. 24×7 hot water, free WiFi, free parking.
                    2 minutes from Mata Pathwari Mandir, 10 min from Krishna Janmabhoomi.
                  </p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate("/rooms")}
                      className="btn-luxe w-full text-sm"
                    >
                      View Rooms & Prices
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <a
                      href={waLink("Namaskaram! I'd like to book a room at Guruvayur Dham. Please share availability and rates.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost-luxe w-full text-sm"
                    >
                      <MessageCircle className="h-4 w-4" /> Book on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Quick info */}
                <div className="card-luxe p-5">
                  <h4 className="font-serif text-sm text-champagne">Quick Info</h4>
                  <ul className="mt-3 space-y-2 text-xs text-ivory/60">
                    <li className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-champagne/60" />
                      <span>Natwar Nagar, Dholi Pyau, Mathura, UP 281001</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-champagne/60" />
                      <span>Check-in: 12 PM · Check-out: 11 AM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-champagne/60" />
                      <span>Book 60+ days ahead for festivals</span>
                    </li>
                  </ul>
                </div>

                {/* Related pages */}
                <div className="card-luxe p-5">
                  <h4 className="font-serif text-sm text-champagne">Related Guides</h4>
                  <ul className="mt-3 space-y-1.5">
                    {getRelatedPages(page.slug, page.category).map((rel) => (
                      <li key={rel.slug}>
                        <button
                          onClick={() => navigate(`/${rel.slug}`)}
                          className="flex w-full items-center justify-between text-left text-xs text-ivory/60 transition-colors hover:text-champagne"
                        >
                          {rel.navLabel}
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-maroon py-16 text-cream">
        <div className="container-x text-center">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Ready to Book Your Stay?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/80">
            Guruvayur Dham — clean rooms, honest pricing, and warm pilgrim hospitality since 1998.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/rooms")} className="btn-luxe text-sm">
              View All Rooms
            </button>
            <MagneticButton href={waLink("Namaskaram! I'd like to book a room at Guruvayur Dham.")}>
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper: get related pages in the same category (excluding current)
function getRelatedPages(currentSlug: string, category: SEOPageCategory) {
  return getSEOPagesByCategory(category)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 5);
}
