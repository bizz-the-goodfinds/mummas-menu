import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// e.g. https://jdxkluilfpjclltvvinv.supabase.co — needed by CSP (admin auth
// calls from the browser) and the image optimizer (menu images on Storage).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = SUPABASE_URL.replace(/^https?:\/\//, "");

const CSP = [
  "default-src 'self'",
  // React DevTools and HMR require eval() in dev; never shipped to production.
  // Firebase Analytics loads gtag.js from Google Tag Manager.
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `img-src 'self' data: https://images.unsplash.com https://plus.unsplash.com https://images.pexels.com${SUPABASE_URL ? ` ${SUPABASE_URL}` : ""}`,
  // Firebase Analytics/Installations SDKs call these endpoints directly;
  // gtag routes hits through google.com/g/collect under consent-mode restrictions.
  // Supabase: admin login/session refresh calls go straight from the browser.
  `connect-src 'self' https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.google.com${SUPABASE_URL ? ` ${SUPABASE_URL}` : ""}${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
    // Static/local images only change on redeploy, so cache optimized variants for a full year.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Belt-and-braces: the admin layout already sets noindex metadata,
        // but a header can't be missed by crawlers that skip HTML parsing.
        source: "/mm-ops-admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/mm-ops-admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
