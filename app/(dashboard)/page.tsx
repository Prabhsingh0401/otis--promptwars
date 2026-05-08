'use client';
// app/(dashboard)/page.tsx — Explore screen

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { DestinationCardSkeleton } from '@/components/ui/Skeleton';

const TRENDING = [
  { name: 'Paris',   country: 'France',    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80', rating: 4.9, avgDays: 5 },
  { name: 'Tokyo',   country: 'Japan',     image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80', rating: 4.8, avgDays: 7 },
  { name: 'Bali',    country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', rating: 4.7, avgDays: 6 },
  { name: 'New York',country: 'USA',       image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', rating: 4.7, avgDays: 4 },
];

const REGIONAL = [
  { region: 'POPULAR IN ASIA',   destinations: [
    { name: 'Kyoto',   country: 'Japan',    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', rating: 4.9, avgDays: 4 },
    { name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579367?auto=format&fit=crop&w=800&q=80', rating: 4.6, avgDays: 5 },
  ]},
  { region: 'POPULAR IN EUROPE', destinations: [
    { name: 'Rome',     country: 'Italy',  image: 'https://images.unsplash.com/photo-1529260839312-41777c08238d?auto=format&fit=crop&w=800&q=80', rating: 4.8, avgDays: 5 },
    { name: 'Barcelona',country: 'Spain',  image: 'https://images.unsplash.com/photo-1583997051651-8255c48b782c?auto=format&fit=crop&w=800&q=80', rating: 4.7, avgDays: 4 },
  ]},
];

export default function ExplorePage() {
  const router = useRouter();
  const [search,  setSearch]  = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/plan?destination=${encodeURIComponent(search.trim())}`);
    }
  }

  function handleDestinationTap(name: string) {
    router.push(`/plan?destination=${encodeURIComponent(name)}`);
  }

  return (
    <div className="bg-bg-primary min-h-screen pb-32">
      {/* Modern Header */}
      <header className="px-8 pt-12 pb-6">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <p className="text-[13px] font-black text-accent uppercase tracking-[0.2em]">Discover</p>
            <h1 className="text-5xl font-black text-label-primary tracking-tighter">Explore World</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-2xl font-black text-label-primary tracking-tight">Otis</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
          </div>
        </div>

        {/* Elegant Search Bar */}
        <form onSubmit={handleSearch} role="search" className="relative group">
          <label htmlFor="destination-search" className="sr-only">Search destinations</label>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-label-tertiary group-focus-within:text-accent transition-colors duration-300">
            <Search size={22} strokeWidth={2.5} />
          </div>
          <input
            id="destination-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Where to next?"
            className="w-full h-16 pl-16 pr-8 rounded-full bg-fill-secondary border-2 border-transparent focus:border-accent/20 focus:bg-white focus:shadow-2xl transition-all duration-300 text-lg font-bold placeholder:text-label-tertiary/60 outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 h-10 bg-accent text-white rounded-full font-black text-sm active:scale-95 transition-all shadow-lg opacity-0 group-focus-within:opacity-100"
          >
            Search
          </button>
        </form>
      </header>

      <main className="space-y-16">
        {/* Trending Section */}
        <section aria-label="Trending destinations" className="animate-card-in">
          <div className="px-8 flex items-end justify-between mb-6">
             <h2 className="text-2xl font-black text-label-primary tracking-tight">Trending Journeys</h2>
             <button className="text-sm font-bold text-accent hover:underline">View All</button>
          </div>
          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-8 pb-8"
            role="list"
          >
            {TRENDING.map((dest, i) => (
              <button
                key={dest.name}
                onClick={() => handleDestinationTap(dest.name)}
                className="flex-shrink-0 w-72 md:w-80 rounded-card bg-bg-tertiary border border-separator overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/20 active:scale-[0.98] transition-all duration-500 snap-start group animate-card-in"
                style={{ animationDelay: `${i * 100}ms` }}
                role="listitem"
              >
                <div className="h-48 relative overflow-hidden bg-fill-secondary">
                  <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-accent shadow-sm">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-label-primary tracking-tight group-hover:text-accent transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-sm font-bold text-label-secondary uppercase tracking-wider">{dest.country}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent-light px-2.5 py-1 rounded-lg">
                      <span className="text-[12px] font-black text-accent">★</span>
                      <span className="text-[12px] font-black text-accent">{dest.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-separator pt-4">
                     <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-tighter">Avg. Duration</p>
                     <p className="text-xs font-black text-label-primary">{dest.avgDays} Days</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Regional Sections */}
        <div className="px-8 space-y-16">
          {REGIONAL.map(({ region, destinations }, sectionIdx) => (
            <section key={region} aria-label={region} className="animate-card-in" style={{ animationDelay: `${(sectionIdx + 1) * 200}ms` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black text-label-primary tracking-tight capitalize">
                  {region.toLowerCase()}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
                {destinations.map((dest, i) => (
                  <button
                    key={dest.name}
                    onClick={() => handleDestinationTap(dest.name)}
                    className="group bg-bg-tertiary border border-separator rounded-card overflow-hidden active:scale-[0.99] hover:shadow-2xl hover:border-accent/20 transition-all duration-500 flex flex-col sm:flex-row h-full animate-card-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                    role="listitem"
                  >
                    <div className="h-52 sm:h-auto sm:w-40 lg:w-48 shrink-0 relative overflow-hidden bg-fill-secondary">
                      <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-2xl font-black text-label-primary tracking-tight group-hover:text-accent transition-colors">
                            {dest.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className="text-[12px] font-black text-accent">★</span>
                            <span className="text-[12px] font-black text-accent">{dest.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-label-secondary uppercase tracking-widest">{dest.country}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-separator pt-4">
                        <p className="text-[11px] font-bold text-label-tertiary uppercase tracking-tighter">Experience</p>
                        <p className="text-xs font-black text-accent uppercase tracking-widest">Plan Trip</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
