// lib/gemini/prompts.ts
// Prompt engineering for Gemini itinerary generation

import { GenerateItineraryInput } from '@/types';

/**
 * Builds a structured prompt for Gemini to generate a travel itinerary.
 * Uses strict rules to ensure geographically accurate, budget-respecting output.
 */
export function buildItineraryPrompt(input: GenerateItineraryInput): string {
  const startMs = new Date(input.startDate).getTime();
  const endMs   = new Date(input.endDate).getTime();
  const days    = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const dailyBudget = Math.round(input.budget / days);

  return `You are an expert travel planner with deep local knowledge. Generate a detailed ${days}-day itinerary for ${input.destination}.

TRIP DETAILS:
- Destination: ${input.destination}
- Dates: ${input.startDate} to ${input.endDate} (${days} days)
- Travelers: ${input.numberOfTravelers}
- Total Budget: $${input.budget} USD ($${dailyBudget}/day per group)
- Budget Style: ${input.preferences.budget}
- Travel Styles: ${input.preferences.travelStyle.join(', ') || 'general'}
- Dietary Restrictions: ${input.preferences.dietaryRestrictions.join(', ') || 'none'}
- Transport: ${input.preferences.preferredTransport.join(', ') || 'mixed'}
- Mobility: ${input.preferences.mobility}
${input.mustSee?.length ? `- Must-See: ${input.mustSee.join(', ')}` : ''}

STRICT RULES:
1. Activities MUST be geographically clustered per day to minimize travel time.
2. Time structure per day:
   - Morning (08:00–12:00): Outdoor sightseeing or attractions
   - Afternoon (12:00–17:00): Lunch + mix of activities
   - Evening (17:00–21:00): Dinner + optional entertainment
3. Each day MUST include exactly: 1 breakfast spot, 1 lunch spot, 1 dinner spot, and 2-3 non-meal activities.
4. Total estimated cost per day MUST NOT exceed $${dailyBudget}.
5. All GPS coordinates must be REAL and ACCURATE for ${input.destination}. Do not fabricate coordinates.
6. All activity IDs: prefix "act_" + 8 random alphanumeric chars (e.g., "act_a3b7c2d1").
7. All day IDs: prefix "day_" + 8 random alphanumeric chars.
8. Use ISO 8601 date strings (YYYY-MM-DD) for dates.
9. Use "HH:mm" format (24-hour) for all times.
10. currency field must be exactly "USD" (3 chars).

Respond ONLY with a valid JSON object. No markdown fences, no explanation text, no comments.
The JSON must exactly match this TypeScript type:

{
  "title": string,
  "destination": {
    "name": string,
    "country": string,
    "coordinates": { "lat": number, "lng": number },
    "timezone": string
  },
  "days": [
    {
      "id": string,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "id": string,
          "title": string,
          "description": string,
          "category": "attraction" | "restaurant" | "transport" | "accommodation" | "experience",
          "location": {
            "name": string,
            "address": string,
            "coordinates": { "lat": number, "lng": number }
          },
          "timeWindow": { "start": "HH:mm", "end": "HH:mm", "duration": number },
          "estimatedCost": number,
          "currency": "USD",
          "tags": string[],
          "notes": string
        }
      ]
    }
  ],
  "totalBudgetEstimate": number,
  "currency": "USD",
  "travelTips": string[]
}`;
}
