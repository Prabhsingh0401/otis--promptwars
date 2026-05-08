// lib/utils/normalize.ts
// Data normalization helpers — converts raw API responses to internal types

import { Trip, Activity, WeatherData, FlightOption } from '@/types';
import type { ItineraryOutput } from '@/lib/gemini/schema';

/**
 * Convert Gemini itinerary output into a fully typed Trip object.
 */
export function normalizeItineraryToTrip(
  itinerary: ItineraryOutput,
  userId: string,
  tripId: string,
): Trip {
  const now = new Date();
  return {
    id:          tripId,
    userId,
    title:       itinerary.title,
    destination: {
      name:        itinerary.destination.name,
      country:     itinerary.destination.country,
      coordinates: itinerary.destination.coordinates,
      placeId:     '',  // enriched later via Places API
      timezone:    itinerary.destination.timezone,
    },
    startDate:           itinerary.days[0]?.date ?? '',
    endDate:             itinerary.days[itinerary.days.length - 1]?.date ?? '',
    days:                itinerary.days as Trip['days'],
    status:              'draft',
    totalBudgetEstimate: itinerary.totalBudgetEstimate,
    currency:            itinerary.currency,
    travelTips:          itinerary.travelTips,
    createdAt:           now,
    updatedAt:           now,
  };
}

/**
 * Normalize Open-Meteo API response to WeatherData array.
 */
export function normalizeWeatherResponse(data: Record<string, unknown>): WeatherData[] {
  const daily = data.daily as Record<string, unknown[]> | undefined;
  if (!daily) return [];

  const dates          = (daily.time ?? []) as string[];
  const tempMax        = (daily.temperature_2m_max ?? []) as number[];
  const tempMin        = (daily.temperature_2m_min ?? []) as number[];
  const precipitation  = (daily.precipitation_sum ?? []) as number[];
  const weatherCodes   = (daily.weathercode ?? []) as number[];
  const windSpeed      = (daily.windspeed_10m_max ?? []) as number[];

  return dates.map((date, i) => ({
    date,
    temperatureMax:  tempMax[i] ?? 0,
    temperatureMin:  tempMin[i] ?? 0,
    weatherCode:     weatherCodes[i] ?? 0,
    precipitation:   precipitation[i] ?? 0,
    windSpeed:       windSpeed[i] ?? 0,
  }));
}

/**
 * Normalize Travelpayouts flight response to FlightOption array.
 * The /api/flights proxy already normalises the raw response into
 * our FlightOffer shape, so this simply re-maps field names into
 * the shared FlightOption type used across the app.
 */
export function normalizeFlightOffers(data: Record<string, unknown>): FlightOption[] {
  const flights = (data.flights ?? []) as {
    id:          string;
    origin:      string;
    destination: string;
    departure:   string;
    arrival:     string;
    airline:     string;
    price:       number;
    currency:    string;
    duration:    number;
    stops:       number;
  }[];

  return flights.map((f) => ({
    id:          f.id,
    origin:      f.origin,
    destination: f.destination,
    departure:   f.departure,
    arrival:     f.arrival,
    airline:     f.airline,
    price:       f.price,
    currency:    f.currency || 'USD',
    duration:    f.duration,
    stops:       f.stops,
  }));
}

/** @deprecated — Amadeus ISO 8601 duration parser kept for reference */
function parseDurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? '0') * 60) + parseInt(match[2] ?? '0');
}

/**
 * Generate a URL-safe trip ID.
 */
export function generateTripId(): string {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get weather icon emoji for a WMO weather code.
 */
export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3)  return '🌤️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}
