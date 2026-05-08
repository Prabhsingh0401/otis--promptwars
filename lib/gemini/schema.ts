// lib/gemini/schema.ts
// Zod schemas for Gemini structured output validation

import { z } from 'zod';

export const ActivitySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(10),
  category: z.enum(['attraction', 'restaurant', 'transport', 'accommodation', 'experience']),
  location: z.object({
    name: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  timeWindow: z.object({
    start:    z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
    end:      z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
    duration: z.number().min(15).max(480),
  }),
  estimatedCost: z.number().min(0),
  currency: z.string().length(3),
  tags:     z.array(z.string()).default([]),
  notes:    z.string().optional(),
});

export const DaySchema = z.object({
  id:         z.string(),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activities: z.array(ActivitySchema).min(2).max(8),
});

export const ItinerarySchema = z.object({
  title: z.string().min(1),
  destination: z.object({
    name:        z.string(),
    country:     z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    timezone:    z.string(),
  }),
  days:                z.array(DaySchema).min(1).max(30),
  totalBudgetEstimate: z.number().min(0),
  currency:            z.string().length(3),
  travelTips:          z.array(z.string()).max(5).default([]),
});

export type ActivityOutput   = z.infer<typeof ActivitySchema>;
export type DayOutput        = z.infer<typeof DaySchema>;
export type ItineraryOutput  = z.infer<typeof ItinerarySchema>;
