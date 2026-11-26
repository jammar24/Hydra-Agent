import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';
import {
  getFirestore,
  Firestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO-KEY-HYDRA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hydra-agent.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hydra-agent",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hydra-agent.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Enable offline persistence in Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this environment.');
    }
  });

  // Initialize App Check attestation
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }
  if (debugToken || import.meta.env.DEV) {
    try {
      initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: () => Promise.resolve({
            token: debugToken || crypto.randomUUID(),
            expireTimeMillis: Date.now() + 60 * 60 * 1000
          })
        }),
        isTokenAutoRefreshEnabled: true
      });
    } catch {
      console.warn('App Check initialized or simulated environment.');
    }
  }
}

const isDemoConfig = firebaseConfig.apiKey === 'AIzaSyDEMO-KEY-HYDRA';

function safeEmailId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  return 'user_' + Math.abs(hash).toString(36);
}

// Authentication helpers
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string; displayName: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/network-request-failed' || isDemoConfig) {
      console.warn('Firebase Auth Login fallback (offline/demo):', error.code || error.message);
      return {
        uid: safeEmailId(email),
        email,
        displayName: email.split('@')[0]
      };
    }
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string; displayName: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/network-request-failed' || isDemoConfig) {
      console.warn('Firebase Auth Register fallback (offline/demo):', error.code || error.message);
      return {
        uid: safeEmailId(email),
        email,
        displayName: email.split('@')[0]
      };
    }
    throw error;
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (error: any) {
    const code = error?.code || '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function handleGoogleRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.warn('Google redirect result error:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Error signing out:', e);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Persistent per-user task history helpers: users/{uid}/tasks/{taskId}
export async function saveUserTaskToFirestore(userId: string, taskId: string, record: Record<string, unknown>): Promise<void> {
  if (isDemoConfig || !userId || !taskId) return;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', taskId), {
      ...record,
      taskId,
      userId
    });
  } catch (err) {
    console.warn('Firestore task write skipped (offline or rules):', err);
  }
}

export async function loadUserTasksFromFirestore(userId: string, maxItems = 50): Promise<any[]> {
  if (isDemoConfig || !userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    console.warn('Firestore task read skipped (offline or rules):', err);
    return [];
  }
}
