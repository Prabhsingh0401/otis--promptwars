// app/api/weather/route.ts
// Open-Meteo weather proxy — free, no API key required

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat       = searchParams.get('lat');
  const lng       = searchParams.get('lng');
  const startDate = searchParams.get('startDate');
  const endDate   = searchParams.get('endDate');

  if (!lat || !lng || !startDate || !endDate) {
    return Response.json({ error: 'lat, lng, startDate, endDate required' }, { status: 400 });
  }

  // Validate coordinate ranges
  if (Math.abs(parseFloat(lat)) > 90 || Math.abs(parseFloat(lng)) > 180) {
    return Response.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',   lat);
  url.searchParams.set('longitude',  lng);
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'weathercode',
    'windspeed_10m_max',
  ].join(','));
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date',   endDate);
  url.searchParams.set('timezone',   'auto');

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache weather for 1 hour
    });

    if (!response.ok) {
      return Response.json({ error: 'Weather service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: 'Weather request failed' }, { status: 502 });
  }
}
