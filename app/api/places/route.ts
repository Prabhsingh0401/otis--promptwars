// app/api/places/route.ts
// Google Places API proxy — keeps server key off client

import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/utils/rateLimit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!rateLimit(ip, 30, 60_000)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');
  const query   = searchParams.get('query');

  if (!placeId && !query) {
    return Response.json({ error: 'placeId or query required' }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    return Response.json({ error: 'Maps API not configured' }, { status: 503 });
  }

  let endpoint: string;

  if (placeId) {
    endpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,opening_hours,photos,formatted_address,geometry,website,formatted_phone_number&key=${key}`;
  } else {
    endpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query!)}&key=${key}`;
  }

  try {
    const response = await fetch(endpoint, { next: { revalidate: 3600 } }); // cache 1hr
    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Places API request failed' }, { status: 502 });
  }
}
