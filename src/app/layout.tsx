import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const siteUrl = "https://www.guruvayurdham.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Guruvayur Dham — Stay 2 Minutes from Guruvayur Temple | AC Rooms, Pooja Booking",
    template: "%s | Guruvayur Dham",
  },
  description:
    "Book clean AC & non-AC rooms just 2 minutes walk from Guruvayur Temple. 24×7 hot water, free parking, family-friendly. Pooja booking, Palpayasam, Thulabharam & more. ₹700 onwards.",
  keywords: [
    "Guruvayur rooms",
    "Guruvayur temple accommodation",
    "rooms near Guruvayur temple",
    "Guruvayur Dham",
    "Guruvayur pooja booking",
    "Palpayasam booking",
    "Thulabharam Guruvayur",
    "Guruvayur hotel booking",
    "AC rooms Guruvayur",
    "stay near Guruvayur temple",
    "Guruvayur darshan timings",
    "Kerala temple stay",
  ],
  authors: [{ name: "Guruvayur Dham" }],
  creator: "Guruvayur Dham",
  publisher: "Guruvayur Dham",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Guruvayur Dham",
    title: "Guruvayur Dham — Stay 2 Minutes from Guruvayur Temple",
    description:
      "Clean AC & non-AC rooms, 24×7 hot water, family-friendly. Book in 30 seconds. Pooja booking available.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Guruvayur Dham temple accommodation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guruvayur Dham — Stay 2 Minutes from Guruvayur Temple",
    description:
      "Clean AC & non-AC rooms, 24×7 hot water, family-friendly. Book in 30 seconds.",
    images: [
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=630&fit=crop",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${siteUrl}/#hotel`,
    name: "Guruvayur Dham",
    description:
      "Temple accommodation and services provider near Guruvayur Temple offering clean AC & non-AC rooms, pooja booking, and pilgrim services.",
    url: siteUrl,
    telephone: "+91-98765-43210",
    email: "stay@guruvayurdham.com",
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=800&fit=crop",
    priceRange: "₹700 - ₹3500",
    starRating: { "@type": "Rating", ratingValue: "4.9", reviewCount: "847" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "East Nada Road, Near Guruvayur Temple",
      addressLocality: "Guruvayur",
      addressRegion: "Kerala",
      postalCode: "680101",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.5945,
      longitude: 76.0424,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "24x7 Hot Water", value: true },
      { "@type": "LocationFeatureSpecification", name: "AC Rooms", value: true },
      { "@type": "LocationFeatureSpecification", name: "Family Rooms", value: true },
    ],
    checkinTime: "12:00",
    checkoutTime: "11:00",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${dmSerif.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
