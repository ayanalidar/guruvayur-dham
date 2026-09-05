"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CreditCard, CalendarX, CheckCircle2 } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider } from "@/components/site/visuals";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "cancellation", label: "Cancellation Policy", icon: CalendarX },
  { key: "payment", label: "Payment Policy", icon: CreditCard },
  { key: "booking", label: "Booking Policy", icon: FileText },
];

const POLICIES: Record<string, { title: string; sections: { h: string; p: string[] }[] }> = {
  cancellation: {
    title: "Cancellation & Refund Policy",
    sections: [
      {
        h: "1. Cancellation Window",
        p: [
          "Cancellations made 7 or more days before check-in: 90% refund of the total booking amount.",
          "Cancellations made 3-6 days before check-in: 50% refund of the total booking amount.",
          "Cancellations made less than 72 hours before check-in: No refund.",
          "No-shows (guest does not arrive): No refund. The booking is marked as a no-show after 24 hours past check-in time.",
        ],
      },
      {
        h: "2. Festival Season Cancellations",
        p: [
          "Bookings during major festival periods (Holi, Janmashtami, Diwali) have a strict no-refund policy but can be rescheduled to a different date within 60 days at no additional charge, subject to availability.",
          "Festival dates are clearly marked during the booking process. Guests are advised to check the festival calendar before booking.",
        ],
      },
      {
        h: "3. How to Cancel",
        p: [
          "Cancellations can be made via WhatsApp (+91-90908 20208), phone, or email (stay@guruvayurdham.com).",
          "Please provide your booking reference number (starts with GD-) when requesting a cancellation.",
          "Refunds are processed within 5-7 business days to the original payment method.",
        ],
      },
      {
        h: "4. Modified Bookings",
        p: [
          "Date changes are free if made 7+ days before check-in, subject to availability.",
          "Date changes within 7 days of check-in may incur a 25% modification fee.",
          "Room type changes are subject to availability and price difference.",
        ],
      },
    ],
  },
  payment: {
    title: "Payment Policy",
    sections: [
      {
        h: "1. Accepted Payment Methods",
        p: [
          "UPI (Google Pay, PhonePe, Paytm, BHIM)",
          "Credit/Debit Cards (Visa, Mastercard, RuPay)",
          "Net Banking (all major Indian banks)",
          "Cash (INR only, payable at check-in)",
          "Razorpay secure payment gateway for online transactions",
        ],
      },
      {
        h: "2. Advance Payment",
        p: [
          "Regular season: No advance required. Full payment at check-in.",
          "Festival season: 25% advance required to confirm booking. Balance at check-in.",
          "Group bookings (10+ guests): 50% advance required. Balance 7 days before check-in.",
        ],
      },
      {
        h: "3. Taxes & Charges",
        p: [
          "All listed prices are exclusive of taxes. 12% GST (6% CGST + 6% SGST) applies to all bookings.",
          "No hidden charges. The final amount shown during booking is the total payable.",
          "Extra person charge: ₹300/person/night for guests beyond the room's standard capacity.",
        ],
      },
      {
        h: "4. Refund Processing",
        p: [
          "Refunds are processed to the original payment method within 5-7 business days.",
          "Bank/UPI refunds may take an additional 3-5 days to reflect in your account, depending on your bank.",
          "Cash payments are refunded via bank transfer or UPI only.",
        ],
      },
    ],
  },
  booking: {
    title: "Booking Policy",
    sections: [
      {
        h: "1. Check-in & Check-out",
        p: [
          "Standard check-in: 12:00 PM (noon)",
          "Standard check-out: 11:00 AM",
          "Early check-in (from 8:00 AM): ₹200 additional charge, subject to availability.",
          "Late check-out (until 2:00 PM): ₹300 additional charge, subject to availability.",
          "Half-day extension (until 6:00 PM): ₹600 additional charge.",
        ],
      },
      {
        h: "2. Identification Requirements",
        p: [
          "Valid government-issued photo ID is mandatory at check-in for all guests.",
          "Accepted IDs: Aadhaar Card, Passport, Driving License, Voter ID.",
          "Foreign nationals must present their passport with a valid Indian visa.",
          "The name on the ID must match the name on the booking confirmation.",
        ],
      },
      {
        h: "3. Occupancy Rules",
        p: [
          "Maximum occupancy per room type is strictly enforced.",
          "Extra bedding (mattress) available on request: ₹300/night.",
          "Children under 5 stay free when sharing existing bedding.",
          "Children 5-12: ₹200/night extra (with mattress).",
        ],
      },
      {
        h: "4. House Rules",
        p: [
          "Smoking, alcohol, and non-vegetarian food are strictly prohibited on the premises.",
          "Quiet hours: 10:00 PM to 6:00 AM.",
          "Pets are not allowed.",
          "Visitors are welcome in the reception area only (8:00 AM to 9:00 PM).",
          "The management reserves the right to refuse accommodation to any guest without assigning a reason.",
        ],
      },
      {
        h: "5. Force Majeure",
        p: [
          "Guruvayur Dham is not liable for failure to perform obligations due to events beyond our control, including natural disasters, government orders, pandemic restrictions, or civil unrest.",
          "In such cases, bookings will be rescheduled at no charge, subject to availability.",
        ],
      },
    ],
  },
};

export default function PolicyPage() {
  const { navigate } = useHashRoute();
  const [tab, setTab] = useState("cancellation");
  const policy = POLICIES[tab];

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Policies"
        icon={FileText}
        title={<>Booking <GoldFoilText>Policies</GoldFoilText></>}
        subtitle="Clear, transparent policies for cancellations, payments, and bookings. No hidden terms."
        crumbs={[{ label: "Home", route: "/" }, { label: "Policies" }]}
      />

      <section className="bg-ink py-12 lg:py-16">
        <div className="container-x max-w-3xl">
          {/* Tab switcher */}
          <div className="mb-8 flex gap-1.5 rounded-full border border-champagne/15 bg-ink-card p-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                  tab === t.key ? "bg-primary text-primary-foreground" : "text-foreground/60 hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {/* Policy content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-luxe p-6 sm:p-8"
          >
            <h2 className="font-serif text-2xl text-foreground">{policy.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Last updated: January 2026</p>

            <div className="mt-6 space-y-8">
              {policy.sections.map((s, i) => (
                <div key={i}>
                  <h3 className="font-serif text-lg text-foreground">{s.h}</h3>
                  <div className="mt-2 space-y-2">
                    {s.p.map((para, j) => (
                      <p key={j} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <MandalaDivider />

            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-center">
              <p className="text-sm text-foreground/70">
                Questions about our policies? WhatsApp us at <strong className="text-primary">+91-90908 20208</strong> — we reply within 5 minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
