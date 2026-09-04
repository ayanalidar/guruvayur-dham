"use client";

import { FileText } from "lucide-react";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider } from "@/components/site/visuals";
import { SITE } from "@/lib/site-data";

const SECTIONS = [
  {
    h: "1. Acceptance of Terms",
    p: [
      "By accessing and booking through the Guruvayur Dham website, WhatsApp, phone, or any other channel, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.",
      "These terms constitute a legally binding agreement between you ('the Guest') and Guruvayur Dham ('the Property', 'we', 'us', or 'our'), governing your stay and any associated services including pooja booking coordination.",
    ],
  },
  {
    h: "2. Bookings and Confirmation",
    p: [
      "A booking is confirmed only when you receive a written confirmation (via WhatsApp, SMS, or email) from Guruvayur Dham containing a booking reference number. Verbal quotations, rate discussions, or 'checking availability' messages do not constitute a confirmed booking.",
      "All bookings are subject to room availability at the time of confirmation. We reserve the right to decline a booking without assigning any reason. In the rare event that we cannot honour a confirmed booking due to circumstances beyond our control, we will arrange equivalent or better accommodation at a nearby property at our cost.",
    ],
  },
  {
    h: "3. Check-in and Check-out",
    p: [
      "Standard check-in time is 12:00 PM and check-out time is 11:00 AM. Early check-in (from 8:00 AM) is available for an additional charge of ₹200 if the room is ready. Late check-out until 2:00 PM is ₹300; half-day extension until 6:00 PM is ₹600.",
      "Valid government-issued photo identification (Aadhaar, Passport, Driving License, or Voter ID) is mandatory at check-in for all guests. Foreign nationals must present their passport with a valid Indian visa.",
    ],
  },
  {
    h: "4. Payment and Taxes",
    p: [
      "Room rates are quoted in Indian Rupees (₹) and are inclusive of all currently applicable taxes. We accept payment via UPI, debit/credit cards (Visa, Mastercard, RuPay), and cash. Personal cheques are not accepted.",
      "A 10% advance (or one night's room rate, whichever is higher) is required to confirm festival-season bookings (Guruvayur Ekadasi, Vishu, Utsavam). For regular-season bookings, payment is settled at check-in.",
    ],
  },
  {
    h: "5. Cancellation and Refunds",
    p: [
      "Cancellations made 7 or more days before check-in: 90% refund of any advance paid. Cancellations made 3-6 days before check-in: 50% refund. Cancellations made less than 72 hours before check-in: no refund.",
      "Festival-date bookings (Guruvayur Ekadasi, Vishu, Utsavam closing day) have a strict no-refund policy but can be rescheduled to a different date within 60 days at no additional charge, subject to availability. No-shows are treated as cancellations with no refund.",
    ],
  },
  {
    h: "6. House Rules",
    p: [
      "Smoking, alcohol consumption, and non-vegetarian food are strictly prohibited on the premises, in keeping with the sanctity of the temple vicinity. Violation of this rule will result in immediate eviction without refund.",
      "Quiet hours are observed from 10:00 PM to 6:00 AM. Guests are requested to keep noise levels low during these hours to ensure a peaceful environment for all pilgrims. Loud music, parties, or gatherings in rooms are not permitted at any time.",
      "Pets are not allowed on the premises. Visitors are welcome in the reception area only between 8:00 AM and 9:00 PM; in-room visitors require prior permission from the front desk.",
    ],
  },
  {
    h: "7. Pooja Bookings",
    p: [
      "Guruvayur Dham facilitates pooja bookings with the Guruvayur Temple on behalf of guests at the official temple rate, with no commission or markup. However, all pooja bookings are subject to temple availability and confirmation by the Guruvayur Devaswom Board.",
      "We are not liable for cancellations, rescheduling, or modifications of poojas by the temple authorities. Pooja fees paid to the temple are non-refundable once the offering has been performed.",
    ],
  },
  {
    h: "8. Liability",
    p: [
      "Guruvayur Dham is not liable for any loss, theft, or damage to guests' personal belongings, vehicles, or valuables. We provide in-room lockers and a secure safe at reception for valuables · please use them. CCTV operates in common areas for security.",
      "We are not liable for any injury, illness, or accident that may occur during your stay, except where caused by our direct negligence. Guests are advised to carry valid travel insurance for medical emergencies.",
    ],
  },
  {
    h: "9. Force Majeure",
    p: [
      "We are not liable for failure to perform our obligations under these terms where such failure is caused by events beyond our reasonable control, including but not limited to natural disasters, pandemic-related restrictions, civil unrest, government orders, or temple closures.",
    ],
  },
  {
    h: "10. Governing Law and Disputes",
    p: [
      "These terms are governed by the laws of the Republic of India. Any disputes arising from these terms or your stay at Guruvayur Dham shall be subject to the exclusive jurisdiction of the courts in Thrissur, Kerala.",
      "We are committed to resolving all guest concerns amicably. Please contact our manager at " + SITE.phone + " or email care@guruvayurdham.com before initiating any formal dispute resolution.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Legal"
        icon={FileText}
        title={<>Terms of <GoldFoilText>Service</GoldFoilText></>}
        subtitle="Please read these terms carefully before booking your stay at Guruvayur Dham. They define the rules and expectations for both guests and the property."
        crumbs={[{ label: "Home", route: "/" }, { label: "Terms of Service" }]}
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
              <a href="mailto:care@guruvayurdham.com" className="text-champagne hover:text-champagne-bright">
                care@guruvayurdham.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
