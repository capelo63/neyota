import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route to get the client's real IP address
 * This must be done server-side to access the request headers properly
 */
export async function GET(request: NextRequest) {
  // Try to get IP from various headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  let clientIp = '0.0.0.0'; // Fallback

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, the first one is the client
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp;
  } else if (cfConnectingIp) {
    clientIp = cfConnectingIp;
  } else if (request.ip) {
    // Next.js 13+ provides request.ip
    clientIp = request.ip;
  }

  return NextResponse.json({ ip: clientIp });
}
