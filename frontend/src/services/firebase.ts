import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import type { Track, Playlist } from '../audio/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDOTYqX1oJ_Co9kVsIZ0luujxbRXCProUY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'music-f4b19.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'music-f4b19',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'music-f4b19.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '129917659644',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:129917659644:web:99180f8491779e36e12a79',
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication State Management
let currentUser: User | null = null;
let authInitialized = false;
const userListeners: Array<(user: User | null) => void> = [];
const initListeners: Array<() => void> = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authInitialized = true;
  userListeners.forEach((cb) => cb(user));
  initListeners.forEach((cb) => cb());
  initListeners.length = 0;
});

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  userListeners.push(callback);
  if (authInitialized) {
    callback(currentUser);
  }
  return () => {
    const idx = userListeners.indexOf(callback);
    if (idx >= 0) userListeners.splice(idx, 1);
  };
}

export function waitForAuthInit(): Promise<User | null> {
  if (authInitialized) return Promise.resolve(currentUser);
  return new Promise((resolve) => {
    initListeners.push(() => resolve(currentUser));
  });
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function getCurrentUserId(): string {
  if (currentUser?.uid) return currentUser.uid;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('aura_uid') || '';
  }
  return '';
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  currentUser = cred.user;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('aura_uid', cred.user.uid);
  }
  return cred.user;
}

export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  currentUser = cred.user;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('aura_uid', cred.user.uid);
  }
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  currentUser = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('aura_uid');
  }
}

/**
 * Firestore User Data Operations
 */
export async function syncLikeToFirestore(track: Track, isLiked: boolean): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

  try {
    const likeDoc = doc(db, 'users', uid, 'likes', track.id);
    if (isLiked) {
      await setDoc(likeDoc, {
        track,
        likedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(likeDoc);
    }
  } catch {
    // Graceful offline fallback
  }
}

export async function fetchLikedTracksFromFirestore(): Promise<Track[]> {
  const uid = getCurrentUserId();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, 'users', uid, 'likes'));
    const tracks: Track[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.track) {
        tracks.push(data.track);
      }
    });
    return tracks;
  } catch {
    return [];
  }
}

export async function syncRecentToFirestore(track: Track): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

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

export async function fetchRecentTracksFromFirestore(): Promise<Track[]> {
  const uid = getCurrentUserId();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, 'users', uid, 'recentlyPlayed'));
    const tracks: Track[] = [];
    snap.forEach((d) => {
      tracks.push(d.data() as Track);
    });
    return tracks;
  } catch {
    return [];
  }
}

/**
 * Firestore Playlist Operations
 */
export async function savePlaylistToFirestore(playlist: Playlist): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

  try {
    const plDoc = doc(db, 'users', uid, 'playlists', playlist.id);
    await setDoc(plDoc, playlist);
  } catch {
    // Graceful offline fallback
  }
}

export async function fetchPlaylistsFromFirestore(): Promise<Playlist[]> {
  const uid = getCurrentUserId();
  if (!uid) return [];

  try {
    const snap = await getDocs(collection(db, 'users', uid, 'playlists'));
    const playlists: Playlist[] = [];
    snap.forEach((d) => {
      playlists.push(d.data() as Playlist);
    });
    return playlists;
  } catch {
    return [];
  }
}

export async function deletePlaylistFromFirestore(playlistId: string): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

  try {
    await deleteDoc(doc(db, 'users', uid, 'playlists', playlistId));
  } catch {
    // Graceful offline fallback
  }
}

/**
 * Single Active Device Playback Session Operations
 */
export async function updateActivePlaybackSession(
  sessionId: string,
  deviceId: string,
  trackId: string,
  status: 'active' | 'paused'
): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

  try {
    const sessionDoc = doc(db, 'users', uid, 'sessions', 'active');
    await setDoc(
      sessionDoc,
      {
        sessionId,
        deviceId,
        trackId,
        status,
        lastHeartbeat: serverTimestamp(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {
    // Graceful offline fallback
  }
}

export function subscribeToActivePlaybackSession(
  callback: (session: { sessionId: string; deviceId: string; status: string } | null) => void
): () => void {
  const uid = getCurrentUserId();
  if (!uid) return () => {};

  try {
    const sessionDoc = doc(db, 'users', uid, 'sessions', 'active');
    return onSnapshot(
      sessionDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as any);
        } else {
          callback(null);
        }
      },
      () => {
        // Fallback on error
        callback(null);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Privacy Right to Erasure: Permanent data purge
 */
export async function deleteUserFirebaseData(): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) return;

  try {
    const batch = writeBatch(db);

    // Delete likes subcollection
    const likesSnap = await getDocs(collection(db, 'users', uid, 'likes'));
    likesSnap.forEach((d) => batch.delete(d.ref));

    // Delete playlists subcollection
    const plSnap = await getDocs(collection(db, 'users', uid, 'playlists'));
    plSnap.forEach((d) => batch.delete(d.ref));

    // Delete recently played subcollection
    const recentSnap = await getDocs(collection(db, 'users', uid, 'recentlyPlayed'));
    recentSnap.forEach((d) => batch.delete(d.ref));

    // Delete sessions
    batch.delete(doc(db, 'users', uid, 'sessions', 'active'));

    // Delete user profile doc
    batch.delete(doc(db, 'users', uid));

    await batch.commit();
  } catch {
    // Graceful offline fallback
  }
}
