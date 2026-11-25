import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from './config.js';

if (!getApps().length) {
  initializeApp({ projectId: config.firebaseProjectId });
}

export const fdb = getFirestore();
export { FieldValue };

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const doc = await fdb.collection('settings').doc(key).get();
  if (!doc.exists) return fallback;
  return (doc.data()?.value ?? fallback) as T;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await fdb.collection('settings').doc(key).set({ value });
}
