'use client';
// components/shared/WeatherWidget.tsx
// Weather display for a trip day

import type { WeatherData } from '@/types';
import { getWeatherEmoji } from '@/lib/utils/normalize';

interface WeatherWidgetProps {
  weather: WeatherData[];
  compact?: boolean;
}

export default function WeatherWidget({ weather, compact = false }: WeatherWidgetProps) {
  if (!weather.length) return null;

  if (compact) {
    const today = weather[0];
    const emoji = getWeatherEmoji(today.weatherCode);
    return (
      <div className="flex items-center gap-1.5" aria-label={`Weather: ${Math.round(today.temperatureMax)}° high`}>
        <span role="img" aria-hidden>{emoji}</span>
        <span className="text-callout text-label-primary font-semibold">
          {Math.round(today.temperatureMax)}°
        </span>
        <span className="text-footnote text-label-secondary">
          / {Math.round(today.temperatureMin)}°
        </span>
      </div>
    );
  }

  return (
    <section className="rounded-card bg-bg-tertiary p-4" aria-label="Weather forecast">
      <h3 className="text-headline font-semibold text-label-primary mb-3">
        Weather This Week
      </h3>
      <div
        className="w-full h-px bg-separator mb-3"
        role="separator"
        aria-hidden
      />
      <ul className="space-y-2" aria-label="Daily forecast">
        {weather.map((day) => {
          const date  = new Date(day.date + 'T00:00:00');
          const label = date.toLocaleDateString('en-US', { weekday: 'short' });
          const emoji = getWeatherEmoji(day.weatherCode);

          return (
            <li
              key={day.date}
              className="flex items-center gap-3"
              aria-label={`${label}: ${emoji}, ${Math.round(day.temperatureMax)}° high, ${Math.round(day.temperatureMin)}° low`}
            >
              <span className="text-subhead text-label-secondary w-8 shrink-0">{label}</span>
              <span className="text-callout" role="img" aria-hidden>{emoji}</span>
              <span className="text-callout font-semibold text-label-primary ml-auto">
                {Math.round(day.temperatureMax)}°
              </span>
              <span className="text-callout text-label-secondary w-8 text-right">
                {Math.round(day.temperatureMin)}°
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
