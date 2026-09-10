"use client";

import { FileText, ShieldCheck, User, Mail, Phone, Clock, Database, Eye, Trash2, Download, AlertTriangle, Check, Globe } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { SITE } from "@/lib/site-data";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MandalaDivider } from "@/components/site/visuals";

const SECTIONS = [
  {
    h: "1. Data Controller",
    icon: ShieldCheck,
    p: [
      `Guruvayur Dham, located at ${SITE.address}, is the Data Controller under the Digital Personal Data Protection Act, 2023 (DPDP Act). We are responsible for how your personal data is collected, used, stored, and shared.`,
      `Data Protection Officer: The Manager, Guruvayur Dham. Contact: ${SITE.phone} or ${SITE.email}.`,
    ],
  },
  {
    h: "2. Grievance Officer (DPDP Act Section 13)",
    icon: User,
    p: [
      `As required under Section 13 of the DPDP Act, 2023, we have designated a Grievance Officer to address any complaints or concerns regarding data protection.`,
      `Name: The Manager, Guruvayur Dham`,
      `Phone: ${SITE.phone}`,
      `Email: privacy@guruvayurdham.com`,
      `Address: ${SITE.address}`,
      `Response time: Within 10 business days of receiving a complaint (as mandated by the DPDP Act).`,
    ],
  },
  {
    h: "3. Personal Data We Collect",
    icon: Database,
    p: [
      `We collect the following categories of personal data when you use our services:`,
      `• Identity data: Name, age, gender`,
      `• Contact data: Phone number, email address, postal address`,
      `• Booking data: Check-in/check-out dates, room preferences, number of guests, special requests`,
      `• Payment data: We do NOT store card numbers. Payment is processed through Razorpay's PCI-DSS compliant gateway. We store only the transaction reference and amount.`,
      `• Usage data: IP address, browser type, device information, pages visited (via cookies — see Cookie Policy below)`,
      `• ID verification: Government-issued photo ID number (Aadhaar/Passport/DL) — collected at check-in as required by Indian hospitality regulations, stored for 5 years as per law.`,
    ],
  },
  {
    h: "4. Purpose of Data Processing (DPDP Act Section 6)",
    icon: Eye,
    p: [
      `We process your personal data for the following specific, clearly stated purposes:`,
      `• To process room bookings and manage reservations`,
      `• To communicate with you about your booking (confirmation, reminders, check-in instructions)`,
      `• To process payments and issue invoices (GST-compliant)`,
      `• To provide requested services (pooja booking, taxi arrangement, etc.)`,
      `• To comply with legal obligations (ID verification, tax records, guest register as per state regulations)`,
      `• To improve our services (analytics, feedback collection)`,
      `• To send promotional communications (only with your explicit consent — you can opt out anytime)`,
      `We do NOT process your data for any purpose other than those listed above without obtaining fresh consent.`,
    ],
  },
  {
    h: "5. Your Rights Under DPDP Act (Section 11 & 12)",
    icon: ShieldCheck,
    p: [
      `Under the DPDP Act, 2023, you have the following rights regarding your personal data:`,
      `• Right to access: You can request a copy of all personal data we hold about you.`,
      `• Right to correction: You can request correction of inaccurate or incomplete data.`,
      `• Right to erasure ("Right to be Forgotten"): You can request deletion of your data, subject to legal retention requirements (e.g., booking records must be kept for 5 years as per Indian tax law).`,
      `• Right to grievance redressal: You can file a complaint with our Grievance Officer (see Section 2 above).`,
      `• Right to nominate: You can nominate another individual to exercise your rights in case of death or incapacity.`,
      `To exercise any of these rights, contact us at privacy@guruvayurdham.com or call ${SITE.phone}.`,
    ],
  },
  {
    h: "6. Data Retention",
    icon: Clock,
    p: [
      `We retain your personal data only as long as necessary:`,
      `• Booking records: 5 years (as required by Indian Income Tax Act and GST law)`,
      `• Guest ID records: 5 years (as required by state hospitality regulations)`,
      `• Payment records: 7 years (as per RBI guidelines for financial transactions)`,
      `• Marketing data: Until you withdraw consent or 2 years of inactivity, whichever is earlier`,
      `• Analytics data: 26 months (Google Analytics default retention)`,
      `After the retention period, data is securely deleted or anonymized.`,
    ],
  },
  {
    h: "7. Data Sharing with Third Parties",
    icon: Database,
    p: [
      `We share your data with the following categories of third parties ONLY for the purposes stated in Section 4:`,
      `• Channel partners (Booking.com, MakeMyTrip, etc.) — to sync bookings and availability. Only booking-related data is shared.`,
      `• Payment gateway (Razorpay) — to process payments. Razorpay is PCI-DSS Level 1 certified.`,
      `• Cloud hosting (Vercel/Hostinger) — to host our website and database. Servers located in India (Mumbai region) wherever possible.`,
      `• SMS/WhatsApp providers (Twilio/MSG91) — to send booking confirmations and reminders.`,
      `• Government authorities — when legally required (tax audits, law enforcement with valid court order).`,
      `We do NOT sell your personal data to any third party under any circumstances.`,
    ],
  },
  {
    h: "8. Data Security Measures",
    icon: ShieldCheck,
    p: [
      `We implement the following security measures to protect your data:`,
      `• HTTPS/TLS 1.3 encryption for all data in transit`,
      `• Password hashing using PBKDF2 with 100,000 iterations (SHA-512)`,
      `• HTTP-only, SameSite cookies for authentication`,
      `• Rate limiting on authentication APIs (5 attempts/minute)`,
      `• Role-based access control (RBAC) for admin panel`,
      `• Regular security audits and vulnerability assessments`,
      `• Data backups with encryption at rest`,
      `• 2FA (TOTP) support for staff accounts`,
      `• Audit logging of all admin actions (who did what, when, from which IP)`,
    ],
  },
  {
    h: "9. Cookie Policy",
    icon: Database,
    p: [
      `We use the following categories of cookies:`,
      `• Essential cookies: Required for booking, login, and site functionality. Cannot be disabled.`,
      `• Analytics cookies: Google Analytics — help us understand how visitors use our site.`,
      `• Marketing cookies: Facebook Pixel — used to show relevant ads to past visitors.`,
      `You can manage your cookie preferences using the cookie consent banner. You can also clear cookies in your browser settings at any time.`,
    ],
  },
  {
    h: "10. Children's Data",
    icon: ShieldCheck,
    p: [
      `Our services are not directed at children under 18. We do not knowingly collect personal data from minors. If you believe a child has provided us with personal data, please contact our Grievance Officer, and we will promptly delete it.`,
    ],
  },
  {
    h: "11. Data Breach Notification (DPDP Act Section 8(6))",
    icon: AlertTriangle,
    p: [
      `In the event of a personal data breach, we will:`,
      `• Notify the Data Protection Board of India within 72 hours of becoming aware of the breach`,
      `• Notify each affected individual whose data was breached`,
      `• Provide details of: the nature of the breach, the personal data affected, the likely consequences, and the measures taken or proposed to mitigate the breach`,
      `• Take immediate steps to contain and remediate the breach`,
    ],
  },
  {
    h: "12. Cross-Border Data Transfer (DPDP Act Section 16)",
    icon: Globe,
    p: [
      `If we transfer your personal data outside India, we will only do so to countries that have been notified by the Central Government as providing adequate data protection, or with your explicit consent.`,
      `Currently, our hosting (Vercel) may process data in global edge locations. We are working towards full data localization (storing all personal data within India) as required by the DPDP Act.`,
    ],
  },
  {
    h: "13. Changes to This Policy",
    icon: FileText,
    p: [
      `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The "Last updated" date at the top of this page indicates when the policy was last revised. We will notify you of any material changes via email or a prominent notice on our website.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Legal · DPDP Act 2023 Compliant"
        icon={ShieldCheck}
        title={<>Privacy <GoldFoilText>Policy</GoldFoilText></>}
        subtitle="This Privacy Policy is compliant with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011."
        crumbs={[{ label: "Home", route: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="bg-ink py-12 lg:py-16">
        <div className="container-x max-w-3xl">
          <p className="text-sm text-muted-foreground">Last updated: January 2026</p>

          {/* Quick contact */}
          <div className="mt-6 rounded-2xl border border-champagne/15 bg-ink-card p-5">
            <h3 className="flex items-center gap-2 font-serif text-lg text-ivory">
              <ShieldCheck className="h-5 w-5 text-champagne" /> Grievance Officer (DPDP Act)
            </h3>
            <div className="mt-3 grid gap-2 text-sm text-ivory/70 sm:grid-cols-2">
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-champagne/60" /> The Manager, Guruvayur Dham</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-champagne/60" /> {SITE.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-champagne/60" /> privacy@guruvayurdham.com</p>
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-champagne/60" /> Response: 10 business days</p>
            </div>
          </div>

          {/* Your rights quick summary */}
          <div className="mt-6 rounded-2xl border border-champagne/15 bg-ink-card p-5">
            <h3 className="flex items-center gap-2 font-serif text-lg text-ivory">
              <Eye className="h-5 w-5 text-champagne" /> Your Rights (DPDP Act)
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "Right to Access your data",
                "Right to Correct inaccurate data",
                "Right to Erasure (Right to be Forgotten)",
                "Right to Grievance Redressal",
                "Right to Nominate (in case of death)",
                "Right to Withdraw Consent",
              ].map((right, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-ivory/70">
                  <Check className="h-4 w-4 flex-shrink-0 text-green-300" /> {right}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ivory/50">
              To exercise these rights, email <a href="mailto:privacy@guruvayurdham.com" className="text-champagne">privacy@guruvayurdham.com</a> or call {SITE.phone}.
            </p>
          </div>

          <MandalaDivider />

          {/* Full policy sections */}
          <div className="space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={i}>
                <h3 className="flex items-center gap-2 font-serif text-lg text-ivory">
                  <s.icon className="h-5 w-5 text-champagne" /> {s.h}
                </h3>
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
              Questions about your data? Contact our Grievance Officer at{" "}
              <a href="mailto:privacy@guruvayurdham.com" className="text-champagne">privacy@guruvayurdham.com</a>
              {" "}or call <a href={`tel:${SITE.phoneRaw}`} className="text-champagne">{SITE.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
