'use client';
// app/(dashboard)/trips/[id]/page.tsx — Trip detail with itinerary + map

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ItineraryBuilder from '@/components/planner/ItineraryBuilder';
import WeatherWidget from '@/components/shared/WeatherWidget';
import ErrorState from '@/components/ui/ErrorState';
import { ActivityRowSkeleton, SkeletonList } from '@/components/ui/Skeleton';
import { useTrip, useSaveTrip } from '@/hooks/useItinerary';
import type { Day } from '@/types';

// Lazy-load Google Maps — heavy bundle
const TravelMap = dynamic(() => import('@/components/map/TravelMap'), {
  ssr:     false,
  loading: () => (
    <div
      className="w-full h-[300px] bg-fill-secondary rounded-xl animate-shimmer"
      aria-label="Loading map"
    />
  ),
});

import { Briefcase, Calendar, MapPin, Share2, ArrowLeft, MoreVertical, Sparkles } from 'lucide-react';

export default function TripDetailView() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const saveTrip   = useSaveTrip();
  const { data: trip, isLoading, isError, refetch } = useTrip(id);

  // Derive all activities from first selected day for map
  const activitiesForMap = trip?.days?.[0]?.activities ?? [];

  function handleItineraryUpdate(days: Day[]) {
    if (!trip) return;
    saveTrip.mutate({ ...trip, days, updatedAt: new Date() });
  }

  if (isLoading) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-label-secondary font-bold animate-pulse">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-black text-label-primary mb-2">Trip not found</h1>
        <p className="text-label-secondary mb-8 max-w-xs">We couldn't retrieve the details for this journey.</p>
        <button
          onClick={() => router.push('/trips')}
          className="px-8 py-3 bg-bg-tertiary border border-separator rounded-full font-bold active:scale-95 transition-all"
        >
          Back to My Trips
        </button>
      </div>
    );
  }

  const startLabel = new Date(trip.startDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric',
  });
  const endLabel = new Date(trip.endDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-bg-primary min-h-screen pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[45vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop`}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Navigation Overlays */}
        <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-20">
          <button
            onClick={() => router.push('/trips')}
            className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: trip.title, url: window.location.href });
                }
              }}
              className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
            >
              <Share2 size={20} />
            </button>
            <button className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 inset-x-0 p-8 pb-12 z-10 animate-card-in">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {trip.status}
              </span>
              <div className="flex items-center gap-1.5 text-white/80 text-sm font-bold">
                <Calendar size={14} className="text-accent" />
                <span>{startLabel} – {endLabel}</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-none">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/90 font-bold">
                <MapPin size={18} className="text-accent" />
                <span className="text-lg">{trip.destination.name}</span>
              </div>
              <div className="h-4 w-px bg-white/20 hidden md:block" />
              <div className="flex items-center gap-2 text-white/90 font-bold">
                <Sparkles size={18} className="text-accent" />
                <span className="text-lg">{trip.days.length} Day Journey</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Itinerary Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Travel Tips Card */}
            {trip.travelTips && trip.travelTips.length > 0 && (
              <section className="bg-bg-tertiary border border-separator rounded-card p-8 animate-card-in shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-black text-label-primary tracking-tight">Essential Tips</h2>
                </div>
                <div className="grid gap-4">
                  {trip.travelTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-fill-primary/50 rounded-xl border border-separator/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      <p className="text-[15px] font-medium text-label-secondary leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary Section */}
            <section className="space-y-6 animate-card-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-black text-label-primary tracking-tight">Your Itinerary</h2>
                <div className="text-sm font-bold text-label-secondary bg-fill-secondary px-3 py-1 rounded-full border border-separator">
                  ${trip.totalBudgetEstimate?.toLocaleString()} Est.
                </div>
              </div>
              <ItineraryBuilder days={trip.days} onUpdate={handleItineraryUpdate} />
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Map Section */}
            {trip.destination.coordinates && (
              <section className="bg-bg-tertiary border border-separator rounded-card overflow-hidden animate-card-in shadow-sm" style={{ animationDelay: '200ms' }}>
                <div className="p-6 border-b border-separator">
                  <h3 className="font-black text-label-primary tracking-tight flex items-center gap-2">
                    <MapPin size={18} className="text-accent" />
                    Explorer Map
                  </h3>
                </div>
                <div className="h-[400px]">
                  <TravelMap
                    activities={activitiesForMap}
                    center={trip.destination.coordinates}
                    className="w-full h-full"
                  />
                </div>
              </section>
            )}

            {/* Quick Actions / Summary */}
            <section className="bg-accent rounded-card p-8 text-white animate-card-in shadow-xl" style={{ animationDelay: '300ms' }}>
              <h3 className="text-xl font-black mb-4">Journey Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70 font-bold text-sm uppercase">Total Distance</span>
                  <span className="font-black text-lg">--- km</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-white/70 font-bold text-sm uppercase">Stops</span>
                  <span className="font-black text-lg">{activitiesForMap.length} Locations</span>
                </div>
                <div className="pt-4">
                  <button className="w-full py-4 bg-white text-accent rounded-full font-black active:scale-95 transition-all shadow-lg hover:shadow-white/20">
                    Download PDF
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
