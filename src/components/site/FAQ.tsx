"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { FAQS, waLink } from "@/lib/site-data";

export default function FAQ() {
  return (
    <section id="faq" className="relative scroll-mt-20 bg-background py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked
          </span>
          <h2 className="section-title mt-4">
            Your Guruvayur Questions,{" "}
            <span className="text-gradient-saffron">Answered</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We've compiled the 14 questions our guests ask most often. Can't find your
            answer? WhatsApp us any time — we reply within minutes.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-warm"
              >
                <AccordionTrigger className="text-left font-serif text-base text-foreground hover:no-underline sm:text-lg">
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-saffron/10 text-xs font-bold text-saffron-dark">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Bottom CTA */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-maroon p-6 text-cream sm:flex-row">
            <div>
              <p className="font-serif text-xl text-white">Still have a question?</p>
              <p className="text-sm text-cream/80">
                Our front desk is on WhatsApp 24×7 — average reply time under 5 minutes.
              </p>
            </div>
            <a
              href={waLink("Namaskaram! I have a question about staying at Guruvayur Dham.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-saffron-dark"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
