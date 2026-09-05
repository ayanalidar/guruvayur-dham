import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "z.ai",
      },
    ],
  },
  // Vercel Cron — runs the post-stay review funnel every 15 minutes.
  // Finds bookings that checked out ~2 hours ago and sends a Google Reviews
  // request via WhatsApp. Endpoint is at /api/reviews/checkout-funnel
  // and is protected by CRON_SECRET env var.
  async headers() {
    return [
      {
        source: "/api/reviews/checkout-funnel",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
