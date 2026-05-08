// lib/firebase/admin.ts
// Firebase Admin SDK — SERVER-SIDE ONLY
// Never import this in client components

import type { App } from 'firebase-admin/app';

let adminApp: App | null = null;

/**
 * Lazily initialize Firebase Admin to avoid issues during build.
 * Only runs server-side (API routes, middleware).
 */
export async function getAdminApp(): Promise<App> {
  if (adminApp) return adminApp;

  const { initializeApp, getApps, cert } = await import('firebase-admin/app');

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey,
    }),
  });

  return adminApp;
}

export async function getAdminFirestore() {
  const app = await getAdminApp();
  const { getFirestore } = await import('firebase-admin/firestore');
  return getFirestore(app);
}
