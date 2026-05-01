import type { NextConfig } from "next";

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : 'rnzezkzsbdvaizpuukec.supabase.co';

// Security headers applied to all responses
const securityHeaders = [
  // Prevent clickjacking: forbid embedding this site in iframes
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control referrer information sent with requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Disable browser features not needed by this app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  // Content Security Policy
  // - script-src: Next.js requires 'unsafe-inline' and 'unsafe-eval' without nonce setup
  // - connect-src: restrict to known backends (Supabase + geocoding API)
  // - object-src/base-uri: locked down to prevent plugin injection and base-tag hijacking
  // - frame-ancestors: prevents clickjacking (complement to X-Frame-Options)
  {
    key: 'Content-Security-Policy',
    value: [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: https://${SUPABASE_HOST} https://*.tile.openstreetmap.org`,
      `font-src 'self' data:`,
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api-adresse.data.gouv.fr`,
      `media-src 'none'`,
      `object-src 'none'`,
      `frame-src 'none'`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
