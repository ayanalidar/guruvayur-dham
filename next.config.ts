import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel doesn't need standalone output — it has its own serverless bundling.
  // Docker/VPS uses standalone (set via env var DOCKER_BUILD=1 during docker build).
  // Without this conditional, Vercel's onBuildComplete fails with:
  //   ENOENT: no such file or directory, open '.next/next-server.js.nft.json'
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
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
          // theme-init script.
          // SECURITY (Round 3 M10+M11 fix):
          // - 'unsafe-eval' only in dev (Next.js dev tooling needs it; not in prod)
          // - WebSocket connect-src restricted to REALTIME_ALLOWED_ORIGIN env var
          //   (was: wss: ws: wildcards allowed any WebSocket — XSS exfil risk)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              process.env.REALTIME_ALLOWED_ORIGIN
                ? `connect-src 'self' https://graph.facebook.com https://api.razorpay.com ${process.env.REALTIME_ALLOWED_ORIGIN} wss://${new URL(process.env.REALTIME_ALLOWED_ORIGIN).host} ws://${new URL(process.env.REALTIME_ALLOWED_ORIGIN).host}`
                : "connect-src 'self' https://graph.facebook.com https://api.razorpay.com",
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
  // SPA catch-all rewrite — works on BOTH Vercel and Docker/VPS (Caddy).
  //
  // The site is a single-page app: there is only one `app/page.tsx` at the
  // root. Clean URLs like /rooms, /pooja, /blog/my-post, /janmashtami must
  // all serve the same SPA shell so the client-side router can read
  // window.location.pathname and render the right page.
  //
  // Without this rewrite, every clean URL except `/` returns 404 on
  // Docker/Caddy (vercel.json rewrites ONLY apply on Vercel deployments).
  // That's why Google was only indexing 2 pages — every other sitemap URL
  // returned 404 to Googlebot.
  //
  // The negative lookahead excludes:
  //   - /api/*              (API routes — must NOT be rewritten)
  //   - /_next/*            (Next.js static assets)
  //   - /_vercel/*          (Vercel internals)
  //   - /favicon.ico, /robots.txt, /sitemap.xml, /manifest.json
  //   - Static image files at the root (logo-*.png, guruyavur*.png, icon-*.png,
  //     apple-touch-icon.png, favicon-*.png)
  //   - /rooms/*.{jpg,jpeg,png,webp,gif,svg,avif} (room IMAGE FILES in /public/rooms/)
  //     — but NOT /rooms/<slug> page routes (the SPA handles those)
  //   - /webhook/*         (inbound webhooks)
  async rewrites() {
    return [
      {
        source:
          "/((?!api/|_next/|_vercel|favicon.ico|robots.txt|sitemap.xml|manifest.json|manifest.webmanifest|sw.js|workbox-.*\\.js|google.*\\.html|logo-.*\\.png|guruyavur.*\\.png|icon-.*\\.png|apple-touch-icon.png|favicon-.*\\.png|rooms/.*\\.(?:jpg|jpeg|png|webp|gif|svg|avif)|temples/.*|about/.*|webhook/).*)",
        destination: "/",
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
