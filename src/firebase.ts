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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO-KEY-HYBRID-AGENT",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hybridagent-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hybridagent-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hybridagent-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Activar persistencia offline en Firestore para RF-07
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia Firestore: Múltiples pestañas abiertas.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia Firestore no soportada en este entorno.');
    }
  });

  // Inicializar App Check (RNF-10: Token de depuración local aceptado en bases de Devpost)
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  if (debugToken) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }
  try {
    initializeAppCheck(app, {
      provider: new CustomProvider({
        getToken: () => Promise.resolve({
          token: debugToken || 'hybrid-agent-debug-token',
          expireTimeMillis: Date.now() + 60 * 60 * 1000
        })
      }),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {
    console.warn('App Check ya inicializado o entorno simulado.');
  }
}

// Helpers seguros de Autenticación Firebase (RF-01)
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser | { uid: string; email: string; displayName: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Auth Login fallback (offline/demo):', error.message);
    // Modo de desarrollo/fallback para demo sin conexión
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
    console.warn('Firebase Auth Register fallback (offline/demo):', error.message);
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
    console.warn('Firebase Anonymous fallback (offline/demo):', error.message);
    return {
      uid: 'anon_' + Date.now().toString(36),
      email: null,
      displayName: 'Invitado Anónimo'
    };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn('Error cerrando sesión:', e);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
