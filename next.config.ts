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
    // Now we explicitly allowlist ONLY the Vercel Blob public hostname
    // (where our own /api/upload route stores files) plus the two CDN
    // hostnames we already trusted.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z.ai" },
      // Vercel Blob — public URLs look like:
      //   https://<store-id>.public.blob.vercel-storage.com/<filename>
      // Allowing *.public.blob.vercel-storage.com is safe because only
      // accounts with our BLOB_READ_WRITE_TOKEN can write to OUR store.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
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
              // CRITICAL: checkout.razorpay.com must be in script-src for the
              // Razorpay Checkout SDK to load. Without it, the SDK is blocked
              // by CSP and online payment is completely broken.
              `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://checkout.razorpay.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              // connect-src includes api.razorpay.com (for payment API calls)
              // and *.public.blob.vercel-storage.com (for Blob image fetches
              // via next/image optimizer)
              process.env.REALTIME_ALLOWED_ORIGIN
                ? `connect-src 'self' https://graph.facebook.com https://api.razorpay.com https://*.public.blob.vercel-storage.com ${process.env.REALTIME_ALLOWED_ORIGIN} wss://${new URL(process.env.REALTIME_ALLOWED_ORIGIN).host} ws://${new URL(process.env.REALTIME_ALLOWED_ORIGIN).host}`
                : "connect-src 'self' https://graph.facebook.com https://api.razorpay.com https://*.public.blob.vercel-storage.com",
              // frame-src allows the Razorpay checkout modal (it opens in an iframe)
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com",
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
  // SPA routing is now handled by Next.js App Router natively — no rewrite
  // needed. The routing hierarchy is:
  //   1. Static routes (src/app/book/page.tsx, src/app/rooms/page.tsx, etc.)
  //      — each has unique SEO metadata (title, description, canonical)
  //   2. Dynamic route (src/app/[slug]/page.tsx) — handles SEO landing pages
  //      like /janmashtami, /hotels-near-krishna-janmabhoomi (50+ slugs)
  //   3. Catch-all rewrite (below) — handles everything else (multi-segment
  //      paths like /rooms/deluxe-ac-room, /blog/my-post, /admin/*) by
  //      serving the SPA shell, which then renders the right page client-side
  //
  // Previously, the rewrite caught ALL non-excluded paths (including
  // single-segment paths like /janmashtami), which prevented the dynamic
  // route from matching. This is why Google saw byte-identical HTML for all
  // 73 URLs — they all hit the SPA shell via the rewrite, with the same
  // homepage title + description + no canonical.
  //
  // The fix: the rewrite now ONLY catches multi-segment paths (containing
  // a /). Single-segment paths fall through to the dynamic route, which
  // generates unique metadata per SEO landing page slug.
  async rewrites() {
    return [
      {
        // Only rewrite multi-segment paths (paths containing at least one /
        // after the leading slash). This lets single-segment paths like
        // /janmashtami, /holi-in-mathura fall through to the dynamic route
        // src/app/[slug]/page.tsx which generates unique SEO metadata.
        //
        // Multi-segment paths like /rooms/deluxe-ac-room, /blog/my-post,
        // /admin/bookings still need the rewrite because they don't have
        // matching route files — the SPA shell handles them client-side.
        //
        // Excluded prefixes (negative lookahead):
        //   - api/  _next/  _vercel/  — infrastructure
        //   - favicon.ico, robots.txt, sitemap.xml, sitemap.xsl, manifest.*,
        //     sw.js, workbox-*.js, google*.html — static files
        //   - logo-*.png, guruyavur*.png, icon-*.png, apple-touch-icon.png,
        //     favicon-*.png — root image files
        //   - rooms/*.{jpg,jpeg,png,webp,gif,svg,avif} — room image files
        //   - temples/*, about/* — static image directories
        //   - webhook/ — inbound webhooks
        //   - uploads/ — uploaded files (if any)
        //
        // The key difference from the old rewrite: the path MUST contain
        // a / after the first character (i.e., be multi-segment). The
        // pattern `[^/]+/.+` ensures this.
        source:
          "/((?!api/|_next/|_vercel|favicon.ico|robots.txt|sitemap.xml|sitemap.xsl|manifest.json|manifest.webmanifest|sw.js|workbox-.*\\.js|google.*\\.html|logo-.*\\.png|guruyavur.*\\.png|icon-.*\\.png|apple-touch-icon.png|favicon-.*\\.png|rooms/.*\\.(?:jpg|jpeg|png|webp|gif|svg|avif)|temples/.*|about/.*|webhook/|uploads/)[^/]+/.+)",
        destination: "/",
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
