// hooks/useRealtime.ts
// Firestore real-time snapshot listeners — live trip updates

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Trip } from '@/types';

/**
 * Subscribe to a single trip in real-time.
 * Automatically unsubscribes on unmount.
 */
export function useRealtimeTrip(tripId: string | undefined) {
  const [trip,    setTrip]    = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'trips', tripId),
      (snapshot) => {
        if (snapshot.exists()) {
          setTrip({ id: snapshot.id, ...snapshot.data() } as Trip);
        } else {
          setTrip(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tripId]);

  return { trip, loading, error };
}

/**
 * Subscribe to all trips for a user in real-time.
 */
export function useRealtimeTrips(userId: string | undefined) {
  const [trips,   setTrips]   = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTrips(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Trip)));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { trips, loading, error };
}
