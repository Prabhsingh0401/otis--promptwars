// lib/flights/client.ts
// Travelpayouts (Aviasales) Flight Prices API — free tier, no expiring tokens
// Docs: https://support.travelpayouts.com/hc/en-us/articles/203956173
// Returns cheapest direct/connecting fares for a route/month

export interface FlightOffer {
  id:          string;
  origin:      string;
  destination: string;
  departure:   string;  // ISO 8601 date string
  arrival:     string;  // ISO 8601 date string
  airline:     string;
  price:       number;
  currency:    string;
  duration:    number;  // minutes (estimated)
  stops:       number;
  bookingUrl:  string;
}

/**
 * Fetch cheapest flight prices using Travelpayouts Flight Data API.
 * No token exchange needed — uses a static API token from env.
 */
export async function searchFlights(
  origin:      string,
  destination: string,
  date:        string,   // YYYY-MM-DD
  adults:      number,
): Promise<FlightOffer[]> {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;

  if (!token) {
    throw new Error('TRAVELPAYOUTS_API_TOKEN is not configured');
  }

  // Parse year/month from date for the monthly cheapest prices endpoint
  const [year, month] = date.split('-');

  const params = new URLSearchParams({
    origin,
    destination,
    depart_date:    `${year}-${month}`,
    one_way:        'true',
    currency:       'usd',
    show_to_affiliates: 'false',
    token,
  });

  const response = await fetch(
    `https://api.travelpayouts.com/v1/prices/cheap?${params}`,
    {
      headers: {
        'X-Access-Token': token,
        Accept:           'application/json',
      },
      // Cache for 1 hour — prices don't change minute-by-minute
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(`Travelpayouts API error: ${response.status}`);
  }

  const json = await response.json() as {
    success: boolean;
    data: Record<string, {
      price:             number;
      airline:           string;
      departure_at:      string;
      return_at:         string;
      expires_at:        string;
      transfers:         number;
      duration:          number;
      link:              string;
    }>;
  };

  if (!json.success || !json.data) {
    return [];
  }

  // Normalise into our FlightOffer shape
  return Object.entries(json.data)
    .slice(0, 5)                      // max 5 results
    .map(([key, offer], index) => ({
      id:          `${origin}-${destination}-${index}`,
      origin,
      destination,
      departure:   offer.departure_at  || `${date}T00:00:00`,
      arrival:     offer.return_at     || `${date}T03:00:00`,
      airline:     offer.airline       || 'Unknown',
      price:       offer.price         || 0,
      currency:    'USD',
      duration:    offer.duration      || 0,
      stops:       offer.transfers     || 0,
      bookingUrl:  offer.link
        ? `https://www.aviasales.com${offer.link}`
        : `https://www.aviasales.com/search/${origin}${date.replace(/-/g, '')}${destination}1`,
    }));
}
