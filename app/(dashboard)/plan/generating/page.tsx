'use client';
// app/(dashboard)/plan/generating/page.tsx
// Full-screen generation screen — no tab bar

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePlannerStore } from '@/stores/plannerStore';
import { useAuth } from '@/app/providers';
import { useSaveTrip } from '@/hooks/useItinerary';
import { normalizeItineraryToTrip, generateTripId } from '@/lib/utils/normalize';
import type { ItineraryOutput } from '@/lib/gemini/schema';
import {Sparkles} from 'lucide-react';

const STATUS_MESSAGES = [
  'Finding the best spots...',
  'Checking travel times...',
  'Building your schedule...',
  'Optimizing routes...',
  'Adding local gems...',
  'Finalizing your itinerary...',
];

export default function GeneratingPage() {
  const router        = useRouter();
  const { user }      = useAuth();
  const plannerInput  = usePlannerStore((s) => s.plannerInput);
  const setDraftTrip  = usePlannerStore((s) => s.setDraftTrip);
  const saveTrip      = useSaveTrip();

  const [progress,   setProgress]  = useState(0);
  const [statusIdx,  setStatusIdx] = useState(0);
  const [error,      setError]     = useState<string | null>(null);
  const hasStarted = useRef(false);

  // Cycle status messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar independently
  useEffect(() => {
    const target = 85; // Go to 85% then jump to 100 when done
    const step   = () => setProgress((p) => Math.min(p + 1, target));
    const timer  = setInterval(step, 400);
    return () => clearInterval(timer);
  }, []);

  // Start generation on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (!plannerInput.destination) {
      router.replace('/plan');
      return;
    }

    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    let itinerary: ItineraryOutput | null = null;

    const timeoutId = setTimeout(() => {
      if (!itinerary) {
        console.error('⌛ Generation timed out');
        setError('Generation is taking longer than expected. Please check your connection and try again.');
        setProgress(0);
      }
    }, 55000); // 55s timeout

    try {
      console.log('🚀 Starting generation...');
      const response = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(plannerInput),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      if (!response.body) throw new Error('No response stream');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let chunksReceived = 0;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          chunksReceived++;
          buffer += decoder.decode(value, { stream: true });
          
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith('data: ')) continue;
            
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.done && data.data) {
                console.log('✅ Itinerary received');
                itinerary = data.data;
                break;
              }
            } catch (parseErr) {
              if (trimmed.includes('"done":true')) {
                console.error('❌ JSON Parse Error:', parseErr);
              }
            }
          }
        }

        if (done || itinerary) break;
      }

      clearTimeout(timeoutId);

      if (!itinerary && buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          if (data.done && data.data) itinerary = data.data;
        } catch (e) {}
      }

      if (!itinerary) throw new Error('Generation finished but no itinerary was received.');

      const tripId = generateTripId();
      const trip   = normalizeItineraryToTrip(itinerary, user?.uid ?? 'anonymous', tripId);
      
      setDraftTrip(trip);
      setProgress(100);

      if (user) {
        try {
          await saveTrip.mutateAsync(trip);
        } catch (saveErr) {
          console.error('Failed to save to cloud:', saveErr);
        }
        router.replace(`/trips/${tripId}`);
      } else {
        router.replace('/trips');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('❌ Generation Error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed.');
      setProgress(0);
    }
  }

  return (
    <div
      className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-8 text-center relative overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Generating your itinerary"
    >
      {/* Animated background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-sm w-full">
        {error ? (
          <div className="animate-card-in">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-label-primary mb-3">
              Something went wrong
            </h1>
            <p className="text-body text-label-secondary mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/plan')}
              className="w-full h-14 bg-bg-tertiary border border-separator rounded-2xl text-label-primary font-bold active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Thinking Visual */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-2 bg-accent/30 rounded-full animate-pulse" />
              <div className="relative w-full h-full bg-bg-tertiary rounded-full border-2 border-accent/20 flex items-center justify-center shadow-2xl">
                <Sparkles size={48} className="text-accent animate-pulse" fill="currentColor" />
              </div>
            </div>

            <div className="space-y-3 animate-card-in">
              <h1 className="text-3xl font-black text-label-primary tracking-tight leading-tight">
                Crafting your <br/>
                <span className="text-accent italic">{plannerInput.destination ?? 'perfect'}</span> trip
              </h1>
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>

            {/* Progress Visual */}
            <div className="space-y-4">
              <div
                className="w-full h-2 bg-fill-secondary rounded-full overflow-hidden shadow-inner"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(var(--color-accent-rgb),0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status Message */}
              <div className="h-6 relative overflow-hidden">
                <p
                  key={statusIdx}
                  className="text-[15px] font-bold text-label-secondary animate-card-in"
                  aria-live="polite"
                >
                  {STATUS_MESSAGES[statusIdx]}
                </p>
              </div>
            </div>

            <p className="text-[13px] font-bold text-label-quaternary uppercase tracking-widest pt-4">
              Wait a few seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
