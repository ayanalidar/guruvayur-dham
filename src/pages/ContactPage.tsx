"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Phone, MessageCircle, Mail, MapPin, Clock, BedDouble, Car, Send,
} from "lucide-react";
import { SITE, CONTACT_REASONS, waLink } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, MandalaDivider, OmWatermark, SectionHeader } from "@/components/site/visuals";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Please enter a valid phone number").regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  reason: z.string().min(1, "Please pick a reason"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  message: z.string().min(5, "Please tell us a little more"),
});
type FormData = z.infer<typeof schema>;

const INFO_CARDS = [
  { icon: Phone, label: "Call Us", value: SITE.phone, href: `tel:${SITE.phoneRaw}`, sub: "Mon–Sun, 24×7" },
  { icon: MessageCircle, label: "WhatsApp", value: SITE.phone, href: waLink("Namaskaram! I'd like to enquire about luxury rooms at Guruvayur Dham."), sub: "Fastest reply · under 5 min" },
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}`, sub: "Reply within 4 hours" },
  { icon: MapPin, label: "Visit", value: SITE.shortAddress, href: SITE.mapLink, sub: "200 m from East Nada gate" },
  { icon: Clock, label: "Check-in / out", value: `${SITE.checkIn} · ${SITE.checkOut}`, href: "#/contact", sub: "Early check-in: ₹200 extra" },
  { icon: Car, label: "Parking", value: "Free, 25+ vehicles", href: "#/contact", sub: "Covered & CCTV-monitored" },
];

export default function ContactPage() {
  const { get } = useContent();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", reason: "", checkIn: "", checkOut: "", message: "" },
  });

  const eyebrow = get("contact.eyebrow", "Get in Touch");
  const title = get("contact.title", "Book Your Stay or Ask Anything");
  const subtitle = get("contact.subtitle", "Fill the form below and we'll WhatsApp you back within minutes · or reach us directly through any of the channels here.");
  const phone = get("contact.phone", SITE.phone);
  const phoneRaw = get("contact.phoneRaw", SITE.phoneRaw);
  const whatsapp = get("contact.whatsapp", SITE.whatsapp);
  const email = get("contact.email", SITE.email);
  const shortAddress = get("contact.shortAddress", SITE.shortAddress);
  const mapEmbed = get("contact.mapEmbed", SITE.mapEmbed);
  const mapLink = get("contact.mapLink", SITE.mapLink);
  const checkInTime = get("contact.checkIn", SITE.checkIn);
  const checkOutTime = get("contact.checkOut", SITE.checkOut);

  const titleParts = title.split(" ");
  const titleHighlight = titleParts.length > 2 ? titleParts.slice(-2).join(" ") : "";
  const titlePre = titleHighlight ? titleParts.slice(0, -2).join(" ").trim() : title;

  const onSubmit = (data: FormData) => {
    const msg = `*New Enquiry from Guruvayur Dham Website*

*Name:* ${data.name}
*Phone:* ${data.phone}
*Reason:* ${data.reason}
*Check-in:* ${data.checkIn || "—"}
*Check-out:* ${data.checkOut || "—"}

*Message:*
${data.message}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Opening WhatsApp with your message…", { description: "We'll reply within 5 minutes during business hours." });
    form.reset();
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={eyebrow}
        icon={MessageCircle}
        title={<>{titlePre} {titleHighlight && <GoldFoilText>{titleHighlight}</GoldFoilText>}</>}
        subtitle={subtitle}
        crumbs={[{ label: "Home", route: "/" }, { label: "Contact" }]}
      />

      {/* Map */}
      <section className="bg-ink py-10">
        <div className="container-x">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl border border-champagne/15 shadow-luxe-lg"
          >
            <div className="relative h-72 w-full sm:h-96">
              <iframe
                src={SITE.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(0.92) hue-rotate(180deg) brightness(0.85) contrast(0.9)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Guruvayur Dham location on Google Maps"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info cards */}
      <section className="bg-ink py-6">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INFO_CARDS.map((card, i) => (
              <motion.a
                key={i}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                whileHover={{ y: -3 }}
                className="card-luxe flex items-start gap-4 p-5"
              >
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent text-champagne">
                  <card.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-ivory/50">{card.label}</p>
                  <p className="truncate font-semibold text-ivory">{card.value}</p>
                  <p className="mt-0.5 text-xs text-ivory/50">{card.sub}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="relative overflow-hidden bg-ink py-16 lg:py-20">
        <OmWatermark className="left-[-6rem] top-20" size="18rem" />
        <div className="container-x relative">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <div className="card-luxe p-6 sm:p-8">
                <h3 className="font-serif text-2xl text-ivory">Send us a message</h3>
                <p className="mt-1 text-sm text-ivory/60">We'll convert your message into a WhatsApp chat for instant reply.</p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-ivory/70">Full Name *</FormLabel>
                          <FormControl><Input placeholder="Rajesh Menon" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-ivory/70">Phone / WhatsApp *</FormLabel>
                          <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="reason" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ivory/70">Reason for Contact *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pick a reason" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {CONTACT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField control={form.control} name="checkIn" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-ivory/70">Check-in Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="checkOut" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-ivory/70">Check-out Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-ivory/70">Your Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your pilgrimage plans, number of guests, room preferences, etc."
                            rows={4}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <button type="submit" className="btn-luxe w-full">
                      <Send className="h-4 w-4" /> Send via WhatsApp
                    </button>
                    <p className="text-center text-xs text-ivory/50">
                      By submitting, you'll be redirected to WhatsApp with your message pre-filled. No spam, ever.
                    </p>
                  </form>
                </Form>
              </div>
            </motion.div>

            {/* Side panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-champagne/15 bg-ink-card p-6 sm:p-8">
                <OmWatermark className="right-[-2rem] top-[-2rem]" size="10rem" />
                <div className="relative">
                  <p className="font-serif text-2xl text-ivory">Why book with us?</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {[
                      "Instant WhatsApp confirmation · no waiting",
                      "Zero booking fee, zero commission on poojas",
                      "Free pickup from Guruvayur railway station (2+ night stays)",
                      "Flexible cancellation up to 7 days before check-in",
                      "Group discounts for 10+ pilgrim batches",
                      "On-site pooja-booking coordinator at your service",
                    ].map((x, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-champagne" />
                        <span className="text-ivory/70">{x}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-xl border border-champagne/12 bg-ink/50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ivory">
                      <BedDouble className="h-4 w-4 text-champagne" /> Rooms from ₹700/night
                    </p>
                    <p className="mt-1 text-xs text-ivory/60">AC, non-AC, family suites, dormitory · all 200 m from East Nada.</p>
                    <MagneticButton
                      href={waLink("Namaskaram! I'd like to know today's best available room rate at Guruvayur Dham.")}
                      className="mt-3 w-full"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Get today's rate
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <MandalaDivider />

      {/* Final */}
      <section className="bg-ink pb-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl rounded-3xl border border-champagne/15 bg-ink-card p-8 text-center sm:p-10">
            <SectionHeader
              eyebrow="Visit Us"
              title={<>We're <GoldFoilText>Here</GoldFoilText> for You</>}
              subtitle="Whether you're planning a quick darshan trip or a multi-day festival visit, our team is ready to make your stay effortless."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
