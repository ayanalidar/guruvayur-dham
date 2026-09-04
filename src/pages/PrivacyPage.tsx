"use client";

import { Shield } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider } from "@/components/site/visuals";
import { SITE } from "@/lib/site-data";

const SECTIONS = [
  {
    h: "1. Information We Collect",
    p: [
      "We collect information you provide directly to us when you book a room, submit an enquiry form, or contact us via WhatsApp, phone, or email. This includes your name, phone number, email address, check-in/check-out dates, number of guests, and any message you choose to share.",
      "We also automatically collect certain technical information when you visit our website, including your IP address, browser type, device type, pages visited, and the date/time of your visit. This information is used solely for analytics and security purposes.",
    ],
  },
  {
    h: "2. How We Use Your Information",
    p: [
      "Your information is used to process room bookings, respond to your enquiries, coordinate pooja bookings with the temple, send booking confirmations and reminders, and improve our services. We may also use your contact details to send you occasional updates about festival dates and special offers, but only if you have explicitly opted in.",
      "We do not sell, rent, or trade your personal information to any third party. Your data is shared only with the Guruvayur Devaswom Board when necessary to process pooja bookings, and with our payment gateway if you choose to pay online.",
    ],
  },
  {
    h: "3. Data Storage and Security",
    p: [
      "Your personal information is stored on secure servers located in India. We use industry-standard encryption (TLS 1.3) for all data transmissions, and access to your data is restricted to authorised staff members who require it to fulfil your booking.",
      "We retain booking records for 7 years as required by Indian tax and hospitality regulations, after which they are securely deleted. Marketing preferences and enquiry data are retained for 2 years unless you request earlier deletion.",
    ],
  },
  {
    h: "4. Cookies and Analytics",
    p: [
      "Our website uses essential cookies to function properly (such as remembering your language preference and form inputs). We also use privacy-respecting analytics to understand how visitors use our site — this data is anonymised and does not identify individual users.",
      "You can disable cookies in your browser settings at any time. Doing so will not affect your ability to browse the website or book rooms, but may limit some personalisation features.",
    ],
  },
  {
    h: "5. Your Rights",
    p: [
      "Under the Digital Personal Data Protection Act, 2023, you have the right to access, correct, or delete your personal information held by us. You may also withdraw consent for marketing communications at any time by replying 'STOP' to any SMS/WhatsApp message or clicking 'unsubscribe' in any email.",
      "To exercise any of these rights, please contact us at privacy@guruvayurdham.com or WhatsApp our data protection officer at " + SITE.phone + ". We will respond to your request within 30 days.",
    ],
  },
  {
    h: "6. Children's Privacy",
    p: [
      "Our website is not directed at children under 18, and we do not knowingly collect personal information from minors. If you believe a child has provided us with personal information, please contact us and we will promptly delete it.",
    ],
  },
  {
    h: "7. Changes to This Policy",
    p: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. The 'last updated' date at the bottom of this page indicates when the policy was last revised. We encourage you to review this page periodically.",
    ],
  },
  {
    h: "8. Contact Us",
    p: [
      "If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:",
      "Guruvayur Dham, " + SITE.address + ". Phone: " + SITE.phone + ". Email: privacy@guruvayurdham.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Legal"
        icon={Shield}
        title={<>Privacy <GoldFoilText>Policy</GoldFoilText></>}
        subtitle="Your privacy is sacred to us. This policy explains what information we collect, how we use it, and the choices you have."
        crumbs={[{ label: "Home", route: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="bg-ink py-16 lg:py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-ivory/50">Last updated: January 12, 2026</p>
            <div className="mt-8 space-y-10">
              {SECTIONS.map((s, i) => (
                <div key={i}>
                  <h2 className="font-serif text-2xl text-ivory">{s.h}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ivory/70 sm:text-base">
                    {s.p.map((para, j) => <p key={j}>{para}</p>)}
                  </div>
                </div>
              ))}
            </div>

            <MandalaDivider />

            <p className="text-center text-sm text-ivory/50">
              Questions? Email us at{" "}
              <a href="mailto:privacy@guruvayurdham.com" className="text-champagne hover:text-champagne-bright">
                privacy@guruvayurdham.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
