import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDOTYqX1oJ_Co9kVsIZ0luujxbRXCProUY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'music-f4b19.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'music-f4b19',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'music-f4b19.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '129917659644',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:129917659644:web:99180f8491779e36e12a79',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8M1S7YL900',
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// State listeners and initialization
let currentUser: User | null = null;
const userListeners: Array<(user: User | null) => void> = [];

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  userListeners.push(callback);
  callback(currentUser);
  return () => {
    const idx = userListeners.indexOf(callback);
    if (idx >= 0) userListeners.splice(idx, 1);
  };
}

export async function initAnonymousAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        userListeners.forEach((cb) => cb(user));
        resolve(user);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          userListeners.forEach((cb) => cb(userCredential.user));
          resolve(userCredential.user);
        } catch (error) {
          console.warn('[Firebase] Anonymous sign-in notice (offline or rule fallback):', error);
          resolve(null);
        }
      }
    });
  });
}

export function getCurrentUserId(): string {
  return currentUser?.uid || localStorage.getItem('aura_anon_uid') || 'anon_session_local';
}

/**
 * Firestore User Data Operations
 */
export async function syncLikeToFirestore(trackId: string, isLiked: boolean): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid || uid === 'anon_session_local') return;

  try {
    const likeDoc = doc(db, 'users', uid, 'likes', trackId);
    if (isLiked) {
      await setDoc(likeDoc, { trackId, likedAt: new Date().toISOString() });
    } else {
      await deleteDoc(likeDoc);
    }
  } catch {
    // Graceful offline fallback
  }
}

export async function syncRecentToFirestore(track: any): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid || uid === 'anon_session_local') return;

  try {
    const recentDoc = doc(db, 'users', uid, 'recentlyPlayed', track.id);
    await setDoc(recentDoc, {
      ...track,
      playedAt: new Date().toISOString(),
    });
  } catch {
    // Graceful offline fallback
  }
}

export async function deleteUserFirebaseData(): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid || uid === 'anon_session_local') return;

  try {
    const batch = writeBatch(db);

    // Delete likes subcollection
    const likesSnap = await getDocs(collection(db, 'users', uid, 'likes'));
    likesSnap.forEach((d) => batch.delete(d.ref));

    // Delete recently played subcollection
    const recentSnap = await getDocs(collection(db, 'users', uid, 'recentlyPlayed'));
    recentSnap.forEach((d) => batch.delete(d.ref));

    // Delete user profile doc
    batch.delete(doc(db, 'users', uid));

    await batch.commit();

    // If signed in, delete the anonymous user
    if (auth.currentUser) {
      await auth.currentUser.delete();
    }
  } catch (e) {
    console.warn('[Firebase] Delete user data notice:', e);
  }
}
