import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * API Route: returns a SHA-256 hash of the client's IP address.
 * The raw IP is never stored — only the hash reaches the client and database.
 * Used solely to record charter acceptance for GDPR compliance.
 *
 * Rate limit: 10 requests per minute per IP.
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  // Rate limit: 10 requests / 60 seconds per IP
  const { allowed, remaining, resetAt } = rateLimit(clientIp, 10, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Hash the IP with SHA-256 — irreversible, GDPR-friendly
  const hashedIp = createHash('sha256').update(clientIp).digest('hex');

  return NextResponse.json(
    { ip: hashedIp },
    {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(remaining),
      },
    }
  );
}
