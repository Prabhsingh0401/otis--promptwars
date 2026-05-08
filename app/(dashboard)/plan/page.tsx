'use client';
// app/(dashboard)/plan/page.tsx — Plan a Trip screen

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, MapPin, Calendar, Users, Wallet, Mountain, Landmark, Umbrella, Utensils, Heart, Gem } from 'lucide-react';
import NavigationBar from '@/components/ui/NavigationBar';
import Button from '@/components/ui/Button';
import { usePlannerStore } from '@/stores/plannerStore';
import { validateDateRange, validateDestination } from '@/lib/utils/validate';
import type { TravelPreferences } from '@/types';

const BUDGET_OPTIONS: { value: TravelPreferences['budget']; label: string; desc: string; icon: typeof Gem }[] = [
  { value: 'budget',   label: 'Budget',   desc: 'Hostels, street food',     icon: Wallet },
  { value: 'moderate', label: 'Moderate', desc: 'Hotels, local restaurants', icon: Gem },
  { value: 'luxury',   label: 'Luxury',   desc: 'Premium stays & dining',    icon: Gem },
];

const STYLE_OPTIONS: { value: TravelPreferences['travelStyle'][number]; label: string; icon: typeof Mountain }[] = [
  { value: 'adventure',  label: 'Adventure',  icon: Mountain },
  { value: 'cultural',   label: 'Cultural',   icon: Landmark },
  { value: 'relaxation', label: 'Relaxation', icon: Umbrella },
  { value: 'foodie',     label: 'Foodie',     icon: Utensils },
  { value: 'family',     label: 'Family',     icon: Heart },
];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getWeekLater(): string {
  const d = new Date();
  d.setDate(d.getDate() + 8);
  return d.toISOString().split('T')[0];
}

function PlanPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { plannerInput, updatePlannerInput } = usePlannerStore();

  const [destination,  setDestination]  = useState(searchParams.get('destination') ?? '');
  const [startDate,    setStartDate]    = useState(plannerInput.startDate ?? getTomorrow());
  const [endDate,      setEndDate]      = useState(plannerInput.endDate   ?? getWeekLater());
  const [travelers,    setTravelers]    = useState(plannerInput.numberOfTravelers ?? 2);
  const [budget,       setBudget]       = useState(plannerInput.budget ?? 2500);
  const [budgetStyle,  setBudgetStyle]  = useState<TravelPreferences['budget']>(
    plannerInput.preferences?.budget ?? 'moderate',
  );
  const [travelStyle,  setTravelStyle]  = useState<TravelPreferences['travelStyle']>(
    plannerInput.preferences?.travelStyle ?? ['cultural'],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!validateDestination(destination)) {
      errs.destination = 'Enter a valid destination (2–200 characters)';
    }
    if (!validateDateRange(startDate, endDate)) {
      errs.dates = 'Dates must be in the future and within 30 days';
    }
    if (travelers < 1 || travelers > 20) {
      errs.travelers = 'Travelers must be 1–20';
    }
    if (budget < 100 || budget > 100_000) {
      errs.budget = 'Budget must be between $100 and $100,000';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleGenerate() {
    if (!validate()) return;

    updatePlannerInput({
      destination,
      startDate,
      endDate,
      numberOfTravelers: travelers,
      budget,
      preferences: {
        budget:              budgetStyle,
        travelStyle,
        dietaryRestrictions: plannerInput.preferences?.dietaryRestrictions ?? [],
        mobility:            plannerInput.preferences?.mobility ?? 'full',
        preferredTransport:  plannerInput.preferences?.preferredTransport ?? ['walking', 'transit'],
      },
    });

    router.push('/plan/generating');
  }

  function toggleStyle(v: TravelPreferences['travelStyle'][number]) {
    setTravelStyle((prev) =>
      prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v],
    );
  }

  const budgetPercent = ((budget - 100) / (20000 - 100)) * 100;

  return (
    <div className="bg-bg-primary min-h-full">
      {/* Hero Section */}
      <div className="relative h-[25vh] min-h-[200px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000&auto=format&fit=crop"
          alt="Planning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-label-primary mb-2">
            Plan your next <span className="text-accent">adventure</span>
          </h1>
          <p className="text-body text-label-secondary max-w-md">
            Enter your destination and preferences to generate a custom itinerary in seconds.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}
        className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 space-y-12 pb-24 relative"
        noValidate
      >
        {/* Destination */}
        <section className="animate-card-in pt-4">
          <div className="relative">
            <MapPin size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-label-tertiary pointer-events-none" aria-hidden />
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              className={[
                'w-full h-14 pl-12 pr-4 rounded-2xl text-body',
                'bg-fill-secondary text-label-primary placeholder:text-label-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-accent transition-shadow',
                errors.destination ? 'ring-2 ring-destructive' : '',
              ].join(' ')}
              aria-describedby={errors.destination ? 'destination-error' : undefined}
              aria-invalid={!!errors.destination}
            />
          </div>
          {errors.destination && (
            <p id="destination-error" className="mt-1.5 px-1 text-footnote text-destructive" role="alert">
              {errors.destination}
            </p>
          )}
        </section>

        {/* When & Who */}
        <section
          className="bg-bg-elevated rounded-2xl shadow-card border border-separator/30 overflow-hidden animate-card-in"
          style={{ animationDelay: '50ms' }}
        >
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <Calendar size={20} strokeWidth={1.5} className="text-accent shrink-0" aria-hidden />
              <span className="text-headline font-semibold text-label-primary">When are you going?</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="text-caption-2 text-label-secondary font-medium mb-1.5 block">
                  Check-in
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={getTomorrow()}
                  className={[
                    'w-full h-12 px-4 rounded-xl text-body',
                    'bg-fill-secondary text-label-primary',
                    'focus:outline-none focus:ring-2 focus:ring-accent transition-shadow',
                    errors.dates ? 'ring-2 ring-destructive' : '',
                  ].join(' ')}
                  aria-describedby={errors.dates ? 'dates-error' : undefined}
                  aria-invalid={!!errors.dates}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="text-caption-2 text-label-secondary font-medium mb-1.5 block">
                  Check-out
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className={[
                    'w-full h-12 px-4 rounded-xl text-body',
                    'bg-fill-secondary text-label-primary',
                    'focus:outline-none focus:ring-2 focus:ring-accent transition-shadow',
                    errors.dates ? 'ring-2 ring-destructive' : '',
                  ].join(' ')}
                />
              </div>
            </div>
            {errors.dates && (
              <p id="dates-error" className="text-footnote text-destructive" role="alert">
                {errors.dates}
              </p>
            )}

            <hr className="border-separator" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} strokeWidth={1.5} className="text-accent shrink-0" aria-hidden />
                <span className="text-headline font-semibold text-label-primary">Travelers</span>
              </div>
              <div className="flex items-center gap-4" role="group" aria-label="Number of travelers">
                <button
                  type="button"
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                  className="w-9 h-9 rounded-full bg-fill-secondary text-accent font-bold text-lg flex items-center justify-center hover:bg-accent/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30"
                  aria-label="Decrease travelers"
                  disabled={travelers <= 1}
                >
                  −
                </button>
                <span className="text-title-2 font-bold text-label-primary w-6 text-center tabular-nums" aria-live="polite">
                  {travelers}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                  className="w-9 h-9 rounded-full bg-fill-secondary text-accent font-bold text-lg flex items-center justify-center hover:bg-accent/10 transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-30"
                  aria-label="Increase travelers"
                  disabled={travelers >= 20}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Budget Style */}
        <section className="animate-card-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <Wallet size={20} strokeWidth={1.5} className="text-accent shrink-0" aria-hidden />
            <span className="text-headline font-semibold text-label-primary">Budget Style</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Budget style">
            {BUDGET_OPTIONS.map(({ value, label, desc, icon: BudgetIcon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={budgetStyle === value}
                onClick={() => setBudgetStyle(value)}
                className={[
                  'rounded-2xl p-4 text-left transition-all duration-200 border',
                  'focus-visible:ring-2 focus-visible:ring-accent',
                  budgetStyle === value
                    ? 'bg-accent/10 border-accent/30 shadow-sm'
                    : 'bg-bg-elevated border-separator/30 hover:border-accent/20 hover:shadow-sm',
                ].join(' ')}
              >
                <BudgetIcon
                  size={22}
                  strokeWidth={1.5}
                  className={budgetStyle === value ? 'text-accent mb-2' : 'text-label-secondary mb-2'}
                  aria-hidden
                />
                <p className={[
                  'text-body font-semibold mb-0.5',
                  budgetStyle === value ? 'text-accent' : 'text-label-primary',
                ].join(' ')}>
                  {label}
                </p>
                <p className="text-caption-1 text-label-tertiary leading-tight">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Travel Style */}
        <section className="animate-card-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <Mountain size={20} strokeWidth={1.5} className="text-accent shrink-0" aria-hidden />
            <span className="text-headline font-semibold text-label-primary">Travel Style</span>
          </div>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Travel styles">
            {STYLE_OPTIONS.map(({ value, label, icon: StyleIcon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={travelStyle.includes(value)}
                onClick={() => toggleStyle(value)}
                className={[
                  'flex items-center gap-2.5 px-5 py-3 rounded-xl text-body font-medium transition-all duration-200 border',
                  'focus-visible:ring-2 focus-visible:ring-accent',
                  travelStyle.includes(value)
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-bg-elevated text-label-secondary border-separator/30 hover:border-accent/20 hover:text-label-primary',
                ].join(' ')}
              >
                <StyleIcon size={18} strokeWidth={1.5} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Budget Slider */}
        <section
          className="bg-bg-elevated rounded-2xl shadow-card border border-separator/30 p-5 animate-card-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Wallet size={20} strokeWidth={1.5} className="text-accent shrink-0" aria-hidden />
              <span className="text-headline font-semibold text-label-primary">Total Budget</span>
            </div>
            <span className="text-title-1 font-bold text-accent">${budget.toLocaleString()}</span>
          </div>
          <input
            id="budget-slider"
            type="range"
            min={100}
            max={20000}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-accent"
            style={{
              background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${budgetPercent}%, var(--color-fill-secondary) ${budgetPercent}%, var(--color-fill-secondary) 100%)`,
            }}
            aria-label={`Total budget: $${budget}`}
          />
          <div className="flex justify-between mt-2">
            <span className="text-caption-1 text-label-tertiary">$100</span>
            <span className="text-caption-1 text-label-tertiary">$20,000</span>
          </div>
        </section>

        {/* Generate Button — in form flow */}
        <div className="pt-8 animate-card-in" style={{ animationDelay: '250ms' }}>
          <Button
            type="submit"
            fullWidth
            className="shadow-sheet h-14 rounded-2xl text-body font-bold"
            aria-label="Generate my trip itinerary"
          >
            <Sparkles size={20} strokeWidth={1.5} className="mr-2" aria-hidden />
            Generate My Trip
          </Button>
        </div>
      </form>

    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="bg-bg-primary min-h-full">
        <NavigationBar title="Plan a Trip" largeTitle />
        <div className="max-w-7xl mx-auto px-6 space-y-4 pt-4">
          <div className="h-14 w-full bg-fill-secondary rounded-2xl animate-shimmer" />
          <div className="h-48 w-full bg-bg-elevated rounded-2xl animate-shimmer" />
          <div className="h-24 w-full bg-bg-elevated rounded-2xl animate-shimmer" />
        </div>
      </div>
    }>
      <PlanPageContent />
    </Suspense>
  );
}
