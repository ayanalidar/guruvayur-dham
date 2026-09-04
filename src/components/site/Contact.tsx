"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  BedDouble,
  Car,
  Send,
} from "lucide-react";
import { SITE, CONTACT_REASONS, waLink } from "@/lib/site-data";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  reason: z.string().min(1, "Please pick a reason"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  message: z.string().min(5, "Please tell us a little more"),
});

type FormData = z.infer<typeof schema>;

const INFO_CARDS = [
  {
    icon: Phone,
    label: "Call Us",
    value: SITE.phone,
    href: `tel:${SITE.phoneRaw}`,
    sub: "Mon–Sun, 24×7",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: SITE.phone,
    href: waLink("Namaskaram! I'd like to enquire about rooms at Guruvayur Dham."),
    sub: "Fastest reply — under 5 min",
  },
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    sub: "Reply within 4 hours",
  },
  {
    icon: MapPin,
    label: "Visit",
    value: SITE.shortAddress,
    href: SITE.mapLink,
    sub: "200 m from East Nada gate",
  },
  {
    icon: Clock,
    label: "Check-in / out",
    value: `${SITE.checkIn} · ${SITE.checkOut}`,
    href: "#contact",
    sub: "Early check-in: ₹200 extra",
  },
  {
    icon: Car,
    label: "Parking",
    value: "Free, 25+ vehicles",
    href: "#contact",
    sub: "Covered & CCTV-monitored",
  },
];

export default function Contact() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      reason: "",
      checkIn: "",
      checkOut: "",
      message: "",
    },
  });

  const onSubmit = (data: FormData) => {
    const msg = `*New Enquiry from Guruvayur Dham Website*

*Name:* ${data.name}
*Phone:* ${data.phone}
*Reason:* ${data.reason}
*Check-in:* ${data.checkIn || "—"}
*Check-out:* ${data.checkOut || "—"}

*Message:*
${data.message}`;
    window.open(waLink(msg), "_blank");
    toast.success("Opening WhatsApp with your message…", {
      description: "We'll reply within 5 minutes during business hours.",
    });
    form.reset();
  };

  return (
    <section id="contact" className="relative scroll-mt-20 bg-muted/30 py-20 lg:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Get in Touch</span>
          <h2 className="section-title mt-4">
            Book Your Stay or{" "}
            <span className="text-gradient-saffron">Ask Anything</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Fill the form below and we'll WhatsApp you back within minutes — or reach
            us directly through any of the channels here.
          </p>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 overflow-hidden rounded-3xl border border-border shadow-warm"
        >
          <div className="relative h-72 w-full sm:h-96">
            <iframe
              src={SITE.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Guruvayur Dham location on Google Maps"
            />
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className="card-warm flex items-start gap-4 p-5 hover:shadow-warm-lg"
            >
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-saffron text-white shadow-warm">
                <card.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p className="truncate font-semibold text-foreground">{card.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Form + side panel */}
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="card-warm p-6 sm:p-8">
              <h3 className="font-serif text-2xl text-foreground">Send us a message</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll convert your message into a WhatsApp chat for instant reply.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="mt-6 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rajesh Menon"
                              className="focus-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone / WhatsApp *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+91 98765 43210"
                              className="focus-ring"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Contact *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="focus-ring">
                              <SelectValue placeholder="Pick a reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_REASONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-in Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="focus-ring" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Check-out Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="focus-ring" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your pilgrimage plans, number of guests, room preferences, etc."
                            rows={4}
                            className="focus-ring resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <button type="submit" className="btn-brand w-full">
                    <Send className="h-4 w-4" /> Send via WhatsApp
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you'll be redirected to WhatsApp with your message
                    pre-filled. No spam, ever.
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
            <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-maroon p-6 text-cream sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-10 select-none font-serif text-[10rem] leading-none text-gold/10">
                ॐ
              </div>
              <div className="relative">
                <p className="font-serif text-2xl text-white">Why book with us?</p>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    "Instant WhatsApp confirmation — no waiting",
                    "Zero booking fee, zero commission on poojas",
                    "Free pickup from Guruvayur railway station (2+ night stays)",
                    "Flexible cancellation up to 7 days before check-in",
                    "Group discounts for 10+ pilgrim batches",
                    "On-site pooja-booking coordinator at your service",
                  ].map((x, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                      <span className="text-cream/90">{x}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <BedDouble className="h-4 w-4 text-gold-light" />
                    Rooms from ₹700/night
                  </p>
                  <p className="mt-1 text-xs text-cream/80">
                    AC, non-AC, family suites, dormitory — all 200 m from East Nada.
                  </p>
                  <a
                    href={waLink(
                      "Namaskaram! I'd like to know today's best available room rate at Guruvayur Dham."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-saffron-dark"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Get today's rate
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
