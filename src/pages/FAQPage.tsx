"use client";

import { motion } from "framer-motion";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { FAQS, waLink } from "@/lib/site-data";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, MandalaDivider, OmWatermark, SectionHeader } from "@/components/site/visuals";

export default function FAQPage() {
  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Frequently Asked"
        icon={HelpCircle}
        title={<>Your Guruvayur Questions, <GoldFoilText>Answered</GoldFoilText></>}
        subtitle="We've compiled the 14 questions our guests ask most often. Can't find your answer? WhatsApp us any time — we reply within minutes."
        crumbs={[{ label: "Home", route: "/" }, { label: "FAQ" }]}
      />

      <section className="relative overflow-hidden bg-ink py-16 lg:py-20">
        <OmWatermark className="right-[-6rem] top-20" size="20rem" />
        <div className="container-x relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
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

          <MandalaDivider />

          {/* Bottom CTA */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-champagne/15 bg-ink-card p-6 text-center sm:p-8">
            <SectionHeader
              eyebrow="Still Curious?"
              title={<>Have a <GoldFoilText>Different Question?</GoldFoilText></>}
              subtitle="Our front desk is on WhatsApp 24×7 — average reply time under 5 minutes."
            />
            <div className="mt-6 flex justify-center">
              <MagneticButton href={waLink("Namaskaram! I have a question about staying at Guruvayur Dham.")}>
                <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
