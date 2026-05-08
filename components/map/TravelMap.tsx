'use client';
// components/map/TravelMap.tsx
// Google Maps with activity markers and polyline route
// Uses @googlemaps/js-api-loader v2 standalone importLibrary function

import { useEffect, useRef, useState } from 'react';
import type { Activity, LatLng } from '@/types';
import { ACTIVITY_CATEGORY_META } from '@/types';

interface TravelMapProps {
  activities:       Activity[];
  center:           LatLng;
  onActivityClick?: (activity: Activity) => void;
  className?:       string;
}

// Use 'any' for map refs — google.maps types not available until runtime load
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMapInstance = any;

export default function TravelMap({
  activities,
  center,
  onActivityClick,
  className = 'w-full h-full',
}: TravelMapProps) {
  const mapDiv      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<AnyMapInstance>(null);
  const markersRef  = useRef<AnyMapInstance[]>([]);
  const polylineRef = useRef<AnyMapInstance>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazily load Maps API using v2 importLibrary standalone function
  useEffect(() => {
    if (!mapDiv.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('[TravelMap] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set');
      return;
    }

    let cancelled = false;

    const init = async () => {
      // v2: Loader sets options, importLibrary is the standalone fn
      const { Loader, importLibrary } = await import('@googlemaps/js-api-loader');

      // Configure the loader (must be called before importLibrary)
      new Loader({ apiKey, version: 'weekly' });

      const { Map } = await importLibrary('maps');

      if (cancelled || !mapDiv.current) return;

      mapInstance.current = new Map(mapDiv.current, {
        center,
        zoom:              13,
        mapId:             'otis_travel_map',
        zoomControl:       true,
        streetViewControl: false,
        mapTypeControl:    false,
        fullscreenControl: false,
      });

      setIsLoaded(true);
    };

    init().catch(console.error);
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render/update markers and polyline when activities change
  useEffect(() => {
    if (!isLoaded || !mapInstance.current) return;

    // Clear previous markers
    markersRef.current.forEach((m: AnyMapInstance) => { m.map = null; });
    markersRef.current = [];

    // Clear polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!activities.length) return;

    // All google.maps.* accessed at runtime — already loaded at this point
    const maps = (window as typeof window & { google: typeof google }).google.maps;

    activities.forEach((activity, index) => {
      let marker: AnyMapInstance;
      const el = buildMarkerEl(activity, index + 1);

      try {
        marker = new maps.marker.AdvancedMarkerElement({
          map:      mapInstance.current,
          position: activity.location.coordinates,
          title:    activity.title,
          content:  el,
        });
      } catch {
        // Fallback for environments where AdvancedMarkerElement isn't available
        marker = new maps.Marker({
          map:      mapInstance.current,
          position: activity.location.coordinates,
          title:    activity.title,
        });
      }

      marker.addListener('click', () => onActivityClick?.(activity));
      markersRef.current.push(marker);
    });

    // Draw route polyline
    if (activities.length > 1) {
      polylineRef.current = new maps.Polyline({
        path:          activities.map((a) => a.location.coordinates),
        map:           mapInstance.current,
        strokeColor:   '#007AFF',
        strokeOpacity: 0.7,
        strokeWeight:  2,
        geodesic:      true,
      });
    }

    // Fit bounds to all markers
    const bounds = new maps.LatLngBounds();
    activities.forEach((a) => bounds.extend(a.location.coordinates));
    mapInstance.current.fitBounds(bounds, 48);
  }, [isLoaded, activities, onActivityClick]);

  return (
    <div
      role="region"
      aria-label="Interactive trip map"
      className={className}
    >
      <div
        ref={mapDiv}
        className="w-full h-full rounded-xl"
        aria-label={`Map showing ${activities.length} activities`}
      />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing {activities.length} activities on map
      </div>
    </div>
  );
}

function buildMarkerEl(activity: Activity, index: number): HTMLElement {
  const meta = ACTIVITY_CATEGORY_META[activity.category];
  const el   = document.createElement('div');
  el.style.cssText = [
    'width:32px;height:32px;border-radius:50%;',
    `background:${meta.color};color:white;`,
    'display:flex;align-items:center;justify-content:center;',
    'font-size:13px;font-weight:700;',
    'box-shadow:0 2px 8px rgba(0,0,0,.24);cursor:pointer;border:2px solid white;',
  ].join('');
  el.textContent = String(index);
  el.setAttribute('aria-label', `Stop ${index}: ${activity.title}`);
  return el;
}
