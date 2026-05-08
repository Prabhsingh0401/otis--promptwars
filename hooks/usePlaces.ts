// hooks/usePlaces.ts
// Google Places data fetching with TanStack Query caching

import { useQuery } from '@tanstack/react-query';

export function usePlaceDetails(placeId: string | undefined) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn:  async () => {
      const res = await fetch(`/api/places?placeId=${encodeURIComponent(placeId!)}`);
      if (!res.ok) throw new Error('Places request failed');
      return res.json();
    },
    enabled:   !!placeId,
    staleTime: 1000 * 60 * 60, // 1 hour — place details rarely change
    gcTime:    1000 * 60 * 60 * 24,
  });
}

export function usePlaceSearch(query: string) {
  return useQuery({
    queryKey: ['places-search', query],
    queryFn:  async () => {
      const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Places search failed');
      return res.json();
    },
    enabled:   query.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
