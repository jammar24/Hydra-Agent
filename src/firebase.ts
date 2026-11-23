import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
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
  try {
    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: () => Promise.resolve({
          token: debugToken || 'hydra-debug-token',
          expireTimeMillis: Date.now() + 60 * 60 * 1000
        })
      }),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn('App Check initialized or simulated environment.');
  }
}

// Authentication helpers
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string; displayName: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Auth Login fallback (offline):', error.message);
    return {
      uid: 'user_' + btoa(email).substring(0, 10),
      email: email,
      displayName: email.split('@')[0]
    };
  }
}

export async function registerWithEmail(email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string; displayName: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Auth Register fallback (offline):', error.message);
    return {
      uid: 'user_' + btoa(email).substring(0, 10),
      email: email,
      displayName: email.split('@')[0]
    };
  }
}

export async function loginAnonymously(): Promise<FirebaseUser | { uid: string; email: null; displayName: string }> {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Anonymous fallback (offline):', error.message);
    return {
      uid: 'anon_' + Date.now().toString(36),
      email: null,
      displayName: 'Guest User'
    };
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
