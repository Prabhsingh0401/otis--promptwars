// app/api/flights/route.ts
// Travelpayouts flight prices proxy — replaces Amadeus sandbox

import { NextRequest } from 'next/server';
import { searchFlights } from '@/lib/flights/client';
import { rateLimit } from '@/lib/utils/rateLimit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!rateLimit(ip, 10, 60_000)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const origin      = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const date        = searchParams.get('date');
  const adults      = parseInt(searchParams.get('adults') ?? '1', 10);

  if (!origin || !destination || !date) {
    return Response.json(
      { error: 'origin, destination, and date are required' },
      { status: 400 },
    );
  }

  // Validate IATA codes (2–3 uppercase letters)
  if (!/^[A-Z]{2,3}$/.test(origin) || !/^[A-Z]{2,3}$/.test(destination)) {
    return Response.json({ error: 'Invalid IATA airport codes' }, { status: 400 });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'Date must be YYYY-MM-DD' }, { status: 400 });
  }

  // Validate adults
  if (isNaN(adults) || adults < 1 || adults > 9) {
    return Response.json({ error: 'Adults must be 1–9' }, { status: 400 });
  }

  try {
    const flights = await searchFlights(origin, destination, date, adults);
    return Response.json({ flights }, {
      headers: {
        // Cache flight results for 1 hour at the CDN/browser level
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Flight search failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
