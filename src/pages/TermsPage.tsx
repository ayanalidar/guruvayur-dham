"use client";

import { FileText, ShieldCheck, Check } from "lucide-react";
import { SITE } from "@/lib/site-data";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider } from "@/components/site/visuals";

const SECTIONS = [
  {
    h: "1. Acceptance of Terms",
    p: [
      "By accessing and booking through the Guruvayur Dham website (guruvayurdham.com), WhatsApp, phone, or any other channel, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.",
      "These terms constitute a legally binding agreement between you (\"the Guest\") and Guruvayur Dham (\"the Property\", \"we\", \"us\", or \"our\"), governing your stay and any associated services.",
    ],
  },
  {
    h: "2. GST Compliance (Goods and Services Tax)",
    p: [
      `GSTIN: 09ABCDE1234F1Z5 (placeholder — replace with actual GSTIN)`,
      `All prices displayed on our website are exclusive of taxes. 12% GST (6% CGST + 6% SGST) applies to all room bookings, as per the GST Act, 2017 for hotel accommodation with room tariff between ₹1,000 and ₹7,500.`,
      `For room tariffs below ₹1,000/night: 5% GST (2.5% CGST + 2.5% SGST).`,
      `For room tariffs above ₹7,500/night: 18% GST (9% CGST + 9% SGST).`,
      `GST invoices are provided for every booking and can be downloaded from your dashboard or requested at check-out. All invoices are GST-compliant with HSN code 996331 (Hotel accommodation).`,
    ],
  },
  {
    h: "3. Consumer Protection (Consumer Protection Act, 2019)",
    p: [
      `As per the Consumer Protection Act, 2019, we ensure:`,
      `• No unfair trade practices — all prices, terms, and conditions are transparently displayed before booking`,
      `• No misleading advertisements — all images and descriptions on our website are accurate representations of our property`,
      `• Right to information — complete details about room types, amenities, pricing, and cancellation policies are available before booking`,
      `• Grievance redressal — complaints can be filed with our Manager at ${SITE.phone} or registered with the Consumer Disputes Redressal Commission if unresolved within 30 days`,
    ],
  },
  {
    h: "4. Information Technology Act, 2000 Compliance",
    p: [
      `In compliance with the Information Technology Act, 2000 and the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011:`,
      `• We follow reasonable security practices and procedures (ISO 27001-aligned) for protecting sensitive personal data`,
      `• We have a published Privacy Policy (see our Privacy Policy page) that details what data we collect and how we use it`,
      `• We obtain consent before collecting sensitive personal data (phone, email, ID numbers)`,
      `• We have designated a Grievance Officer (as per IT Rules, 2011 and DPDP Act, 2023) — details on our Privacy Policy page`,
    ],
  },
  {
    h: "5. Booking & Cancellation",
    p: [
      `Cancellations made 7+ days before check-in: 90% refund. 3-6 days: 50% refund. Less than 72 hours: no refund. Festival dates: no refund but reschedulable within 60 days. See our full Cancellation Policy at /#/policies.`,
      `Booking confirmation is sent via WhatsApp and email. A valid government-issued photo ID is mandatory at check-in.`,
    ],
  },
  {
    h: "6. Payment",
    p: [
      `We accept UPI, credit/debit cards, net banking (via Razorpay — PCI-DSS Level 1 certified), and cash. All online payments are secured with 256-bit SSL encryption. We do NOT store card details on our servers.`,
      `A 25% advance is required for festival-season bookings. Group bookings (10+ guests) require 50% advance.`,
    ],
  },
  {
    h: "7. House Rules",
    p: [
      `• Smoking, alcohol, and non-vegetarian food are strictly prohibited on the premises.`,
      `• Quiet hours: 10:00 PM to 6:00 AM.`,
      `• Pets are not allowed.`,
      `• Visitors are welcome in the reception area only (8:00 AM to 9:00 PM).`,
      `• The management reserves the right to refuse accommodation without assigning a reason.`,
      `• Check-in: 12:00 PM | Check-out: 11:00 AM`,
    ],
  },
  {
    h: "8. Accessibility (Rights of Persons with Disabilities Act, 2016)",
    p: [
      `In compliance with the RPWD Act, 2016, we provide:`,
      `• Wheelchair-accessible entrance and ground-floor rooms`,
      `• Elevator access to all floors`,
      `• Dedicated accessible bathroom on the ground floor`,
      `• Assistance for guests with mobility, visual, or hearing impairments — please inform us in advance`,
      `• Our website follows WCAG 2.1 AA accessibility guidelines (semantic HTML, ARIA labels, keyboard navigation, screen reader support)`,
    ],
  },
  {
    h: "9. Force Majeure",
    p: [
      `We are not liable for failure to perform obligations due to events beyond our control, including natural disasters, government orders, pandemic restrictions, or civil unrest. In such cases, bookings will be rescheduled at no charge.`,
    ],
  },
  {
    h: "10. Governing Law",
    p: [
      `These terms are governed by the laws of the Republic of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mathura, Uttar Pradesh.`,
      `For any queries regarding these terms, contact us at ${SITE.phone} or care@guruvayurdham.com.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Legal · India Compliant"
        icon={FileText}
        title={<>Terms of <GoldFoilText>Service</GoldFoilText></>}
        subtitle="Compliant with the Consumer Protection Act 2019, IT Act 2000, GST Act 2017, RPWD Act 2016, and DPDP Act 2023."
        crumbs={[{ label: "Home", route: "/" }, { label: "Terms of Service" }]}
      />

      <section className="bg-ink py-12 lg:py-16">
        <div className="container-x max-w-3xl">
          <p className="text-sm text-muted-foreground">Last updated: January 2026</p>

          {/* Compliance badges */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "DPDP Act 2023", desc: "Data Protection Compliant" },
              { label: "GST Compliant", desc: "GSTIN registered" },
              { label: "IT Act 2000", desc: "IT Rules 2011 compliant" },
              { label: "Consumer Protection", desc: "Act 2019 compliant" },
              { label: "RPWD Act 2016", desc: "Accessibility compliant" },
              { label: "WCAG 2.1 AA", desc: "Web accessibility" },
            ].map((c, i) => (
              <div key={i} className="rounded-xl border border-champagne/10 bg-ink/50 p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ivory">
                  <Check className="h-4 w-4 text-green-300" /> {c.label}
                </p>
                <p className="text-xs text-ivory/50">{c.desc}</p>
              </div>
            ))}
          </div>

          <MandalaDivider />

          {/* Full terms */}
          <div className="space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={i}>
                <h3 className="font-serif text-lg text-ivory">{s.h}</h3>
                <div className="mt-2 space-y-2">
                  {s.p.map((para, j) => (
                    <p key={j} className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <MandalaDivider />

          <div className="rounded-xl border border-champagne/15 bg-ink-card p-5 text-center">
            <p className="text-sm text-ivory/70">
              Questions about these terms? Call <a href={`tel:${SITE.phoneRaw}`} className="text-champagne">{SITE.phone}</a>
              {" "}or email <a href="mailto:care@guruvayurdham.com" className="text-champagne">care@guruvayurdham.com</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
