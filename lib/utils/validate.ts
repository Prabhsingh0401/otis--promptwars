// lib/utils/validate.ts
// Input sanitization and validation — SECURITY CRITICAL

import { GenerateItineraryInput } from '@/types';

/**
 * Sanitize user input before sending to Gemini.
 * Strips HTML/XSS, clamps numeric values, limits string lengths.
 * Using a manual sanitizer since isomorphic-dompurify may not be installed yet.
 */
export function sanitizeString(input: string, maxLength = 200): string {
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[<>&"']/g, '')           // Remove dangerous chars
    .replace(/javascript:/gi, '')      // Prevent JS injection
    .trim()
    .slice(0, maxLength);
}

export function sanitizeInput(input: GenerateItineraryInput): GenerateItineraryInput {
  return {
    ...input,
    destination: sanitizeString(input.destination, 200),
    mustSee:     input.mustSee?.map((s) => sanitizeString(s, 100)).slice(0, 10),
    numberOfTravelers: Math.min(Math.max(1, Math.floor(Number(input.numberOfTravelers) || 1)), 20),
    budget:            Math.min(Math.max(0, Number(input.budget) || 0), 100_000),
    preferences: {
      ...input.preferences,
      dietaryRestrictions: (input.preferences.dietaryRestrictions ?? [])
        .map((s) => sanitizeString(s, 50))
        .slice(0, 10),
    },
  };
}

/**
 * Validates a date range for trip planning.
 * - Start must be today or in the future
 * - End must be after start
 * - Max 30 days
 */
export function validateDateRange(start: string, end: string): boolean {
  const s = new Date(start);
  const e = new Date(end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDays = 30;

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return false;
  if (s < today) return false;
  if (e <= s) return false;

  const diffDays = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= maxDays;
}

/**
 * Validates that a value is a safe positive integer within range.
 */
export function validatePositiveInt(value: unknown, min = 1, max = 100): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

/**
 * Validates a destination string — non-empty, no injection.
 */
export function validateDestination(destination: string): boolean {
  if (!destination || typeof destination !== 'string') return false;
  const cleaned = sanitizeString(destination);
  return cleaned.length >= 2 && cleaned.length <= 200;
}
