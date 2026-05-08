// app/api/routes/route.ts
// Google Routes API proxy — computes travel time between activities

import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/utils/rateLimit';
import type { LatLng } from '@/types';

interface RouteRequestBody {
  origin:      LatLng;
  destination: LatLng;
  travelMode?: 'WALK' | 'DRIVE' | 'TRANSIT' | 'BICYCLE';
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!rateLimit(ip, 20, 60_000)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: RouteRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { origin, destination, travelMode = 'WALK' } = body;

  if (
    typeof origin?.lat !== 'number' ||
    typeof origin?.lng !== 'number' ||
    typeof destination?.lat !== 'number' ||
    typeof destination?.lng !== 'number'
  ) {
    return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    return Response.json({ error: 'Routes API not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type':     'application/json',
          'X-Goog-Api-Key':   key,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs',
        },
        body: JSON.stringify({
          origin:      { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
          destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
          travelMode,
          computeAlternativeRoutes: false,
        }),
      },
    );

    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Routes API request failed' }, { status: 502 });
  }
}
