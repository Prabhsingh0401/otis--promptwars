// hooks/useItinerary.ts
// TanStack Query hooks for trips and itinerary management

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/client';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import type { Trip, GenerateItineraryInput } from '@/types';
import { generateTripId, normalizeItineraryToTrip } from '@/lib/utils/normalize';
import type { ItineraryOutput } from '@/lib/gemini/schema';

// ─── Fetch all trips for a user ───────────────────────────────────────────────

export function useTrips(userId: string | undefined) {
  return useQuery({
    queryKey: ['trips', userId],
    queryFn:  async () => {
      if (!userId) return [];
      const q        = query(
        collection(db, 'trips'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Trip));
    },
    enabled: !!userId,
  });
}

// ─── Fetch a single trip ──────────────────────────────────────────────────────

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn:  async () => {
      if (!tripId) return null;
      const snapshot = await getDoc(doc(db, 'trips', tripId));
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Trip;
    },
    enabled: !!tripId,
  });
}

// ─── Save / update a trip ─────────────────────────────────────────────────────

export function useSaveTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Trip) => {
      const tripWithTimestamp = {
        ...trip,
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'trips', trip.id), tripWithTimestamp);
      return tripWithTimestamp;
    },
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.userId] });
      queryClient.setQueryData(['trip', trip.id], trip);
    },
  });
}

// ─── Delete a trip ────────────────────────────────────────────────────────────

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, userId }: { tripId: string; userId: string }) => {
      await deleteDoc(doc(db, 'trips', tripId));
      return { tripId, userId };
    },
    onSuccess: ({ tripId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['trips', userId] });
      queryClient.removeQueries({ queryKey: ['trip', tripId] });
    },
  });
}

// ─── Generate + save itinerary ────────────────────────────────────────────────

export function useGenerateAndSaveTrip(userId: string) {
  const saveTrip = useSaveTrip();

  return useMutation({
    mutationFn: async ({
      input,
      itinerary,
    }: {
      input:     GenerateItineraryInput;
      itinerary: ItineraryOutput;
    }) => {
      const tripId = generateTripId();
      const trip   = normalizeItineraryToTrip(itinerary, userId, tripId);
      await saveTrip.mutateAsync(trip);
      return trip;
    },
  });
}
