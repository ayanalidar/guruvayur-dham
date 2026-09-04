import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ServiceWorkerRegister from "@/components/site/ServiceWorkerRegister";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://www.guruvayurdham.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Guruvayur Dham — Luxury Pilgrim Stay 2 Minutes from Guruvayur Temple",
    template: "%s | Guruvayur Dham",
  },
  description:
    "Boutique pilgrim accommodation near Guruvayur Temple. Cinematic dark-luxe rooms, 24×7 hot water, free parking, on-site pooja booking. Walk to East Nada in 2 minutes.",
  keywords: [
    "Guruvayur rooms",
    "Guruvayur temple accommodation",
    "luxury stay Guruvayur",
    "boutique hotel Guruvayur",
    "Guruvayur Dham",
    "Guruvayur pooja booking",
    "Palpayasam booking",
    "Thulabharam Guruvayur",
    "AC rooms Guruvayur",
    "stay near Guruvayur temple",
    "Guruvayur darshan timings",
    "Kerala temple stay",
  ],
  authors: [{ name: "Guruvayur Dham" }],
  creator: "Guruvayur Dham",
  publisher: "Guruvayur Dham",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Guruvayur Dham",
    title: "Guruvayur Dham — Luxury Pilgrim Stay Near Guruvayur Temple",
    description:
      "Boutique dark-luxe rooms, 24×7 hot water, on-site pooja booking. Walk to East Nada in 2 minutes.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Guruvayur Dham — luxury pilgrim stay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guruvayur Dham — Luxury Pilgrim Stay Near Guruvayur Temple",
    description:
      "Boutique dark-luxe rooms, 24×7 hot water, on-site pooja booking. Walk to East Nada in 2 minutes.",
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
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Guruvayur Dham",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: "#0F0A08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
      "Boutique pilgrim accommodation near Guruvayur Temple offering dark-luxe AC & non-AC rooms, pooja booking, and pilgrim services.",
    url: siteUrl,
    telephone: "+91-98765-43210",
    email: "stay@guruvayurdham.com",
    image:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=800&fit=crop",
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
    geo: { "@type": "GeoCoordinates", latitude: 10.5945, longitude: 76.0424 },
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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${manrope.variable} antialiased bg-background text-foreground`}
      >
        <ServiceWorkerRegister />
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
