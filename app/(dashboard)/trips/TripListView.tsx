'use client';
// app/(dashboard)/trips/page.tsx — Trip list

import Link from 'next/link';
import { Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { useTrips } from '@/hooks/useItinerary';
import type { Trip } from '@/types';
import { useRouter } from 'next/navigation';

export default function TripListView() {
  const router    = useRouter();
  const { user }  = useAuth();
  const { data: trips, isLoading, isError, refetch } = useTrips(user?.uid);

  return (
    <div className="bg-bg-primary min-h-screen pb-32">
      {/* Hero Section */}
      <div className="relative h-[20vh] min-h-[160px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop"
          alt="My Trips"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-[13px] font-black text-accent uppercase tracking-[0.2em]">Your Collection</p>
              <h1 className="text-4xl md:text-5xl font-black text-label-primary tracking-tighter">My Journeys</h1>
            </div>
            <Link
              href="/plan"
              className="group flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-black text-sm active:scale-95 transition-all shadow-xl hover:shadow-accent/40"
            >
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Plan New</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="px-6 md:px-8 lg:px-12 max-w-7xl mx-auto pt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-bg-tertiary border border-separator rounded-card animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-20 text-center space-y-4 animate-card-in">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl text-destructive">⚠️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-label-primary">Failed to load trips</h3>
              <p className="text-label-secondary text-sm">Check your connection and try again.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-fill-secondary rounded-full font-black text-sm active:scale-95 transition-all hover:bg-fill-tertiary"
            >
              Retry
            </button>
          </div>
        ) : !trips?.length ? (
          <div className="py-20 text-center space-y-8 animate-card-in">
            <div className="w-32 h-32 bg-fill-secondary rounded-full flex items-center justify-center mx-auto">
              <Briefcase size={48} className="text-label-tertiary" strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-label-primary tracking-tight">No trips yet</h3>
              <p className="text-label-secondary max-w-xs mx-auto text-lg">
                Your future adventures will appear here. Let's start planning one!
              </p>
            </div>
            <button
              onClick={() => router.push('/plan')}
              className="px-10 py-5 bg-accent text-white rounded-full font-black text-lg active:scale-95 transition-all shadow-2xl hover:shadow-accent/30"
            >
              Plan My First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, i) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group block bg-bg-tertiary border border-separator/30 rounded-card overflow-hidden active:scale-[0.98] transition-all hover:shadow-2xl hover:border-accent/20 animate-card-in"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="relative h-48 bg-fill-secondary overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop`}
                    alt={trip.destination.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-white/95 backdrop-blur-md
                      ${trip.status === 'confirmed' ? 'text-accent' :
                        trip.status === 'active' ? 'text-success' :
                        trip.status === 'completed' ? 'text-label-tertiary' : 'text-warning'}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1">{trip.destination.name}</p>
                     <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{trip.title}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-label-tertiary uppercase tracking-widest">Duration</p>
                        <p className="text-sm font-black text-label-primary">{trip.days.length} Days</p>
                      </div>
                      <div className="space-y-0.5 border-l border-separator/50 pl-6">
                        <p className="text-[10px] font-black text-label-tertiary uppercase tracking-widest">Departure</p>
                        <p className="text-sm font-black text-label-primary">
                          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-fill-secondary flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
