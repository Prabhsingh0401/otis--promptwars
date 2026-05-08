// app/api/generate/route.ts
// Gemini itinerary generation with Server-Sent Events streaming

import { NextRequest } from 'next/server';
import { getItineraryModel } from '@/lib/gemini/client';
import { buildItineraryPrompt } from '@/lib/gemini/prompts';
import { ItinerarySchema } from '@/lib/gemini/schema';
import { sanitizeInput, validateDateRange, validateDestination } from '@/lib/utils/validate';
import { rateLimit } from '@/lib/utils/rateLimit';
import type { GenerateItineraryInput } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Rate limiting — 5 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
  if (!rateLimit(ip, 5, 60_000)) {
    return Response.json(
      { error: 'Too many requests. Please wait before generating another itinerary.' },
      { status: 429 },
    );
  }

  let body: GenerateItineraryInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  if (!validateDestination(body.destination)) {
    return Response.json({ error: 'Invalid destination' }, { status: 400 });
  }
  if (!validateDateRange(body.startDate, body.endDate)) {
    return Response.json(
      { error: 'Invalid date range. Must be future dates, max 30 days.' },
      { status: 400 },
    );
  }

  // Sanitize all inputs before passing to AI
  const sanitized = sanitizeInput(body);
  const prompt    = buildItineraryPrompt(sanitized);
  const model     = getItineraryModel();

  // Stream Gemini response as SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        let fullText = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`),
          );
        }

        // Parse and validate full response against Zod schema
        let parsed: unknown;
        try {
          if (!fullText.trim()) {
            throw new Error('AI returned an empty response. This might be due to safety filters or a temporary issue.');
          }
          // Strip any accidental markdown fences
          const clean = fullText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
          parsed = JSON.parse(clean);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'AI returned invalid JSON';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`),
          );
          controller.close();
          return;
        }

        const validated = ItinerarySchema.safeParse(parsed);
        if (!validated.success) {
          console.error('Validation failed:', validated.error.flatten());
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                error: 'AI output failed validation', 
                details: validated.error.flatten() 
              })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, data: validated.data })}\n\n`),
        );
        controller.close();
      } catch (err) {
        let message = 'Generation failed';
        if (err instanceof Error) {
          message = err.message;
          // Check for common Gemini safety/quota errors
          if (message.includes('SAFETY')) message = 'Content blocked by safety filters. Try a different destination.';
          if (message.includes('QUOTA')) message = 'Rate limit exceeded. Please wait a moment.';
        }
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}
