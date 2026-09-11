import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Do NOT ignore TS build errors — they should fail the build, not ship to prod.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable React strict mode in dev — surfaces more bugs early.
  reactStrictMode: true,
  images: {
    // Phase D L5: removed wildcard *.vercel-storage.com patterns — they
    // allowed anyone to host a malicious image on Vercel Blob and have our
    // Next/Image optimizer fetch & process it (SSRF + sharp CVE surface).
    // If you need Vercel Blob image optimization, add your specific blob
    // account hostname here.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z.ai" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      // SECURITY (Phase D H11): Defense-in-depth security headers applied
      // to ALL routes. These close most XSS, clickjacking, MIME-sniffing,
      // and protocol-downgrade attack vectors.
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — never allow this site in an iframe.
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing — browser must respect Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send origin (not full URL) in Referer header to external sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 2 years, including subdomains, eligible for preload list.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Disable camera/mic/geolocation/payment APIs — not needed for a hotel site.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Content-Security-Policy — restricts where scripts/styles/images/connect
          // can come from. 'unsafe-inline' needed for Next.js inline styles + the
          // theme-init script; 'unsafe-eval' needed for some dev tooling.
          // frame-ancestors 'none' = same as X-Frame-Options DENY but CSP-level.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://graph.facebook.com https://api.razorpay.com wss: ws:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/reviews/checkout-funnel",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/uploads/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
