import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, CustomProvider } from 'firebase/app-check';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

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

  // Inicializar App Check de depuración para desarrollo/demo (RNF-10)
  const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || 'hybrid-agent-debug-token';
  initializeAppCheck(app, {
    provider: new CustomProvider({
      getToken: () => Promise.resolve({
        token: debugToken,
        expireTimeMillis: Date.now() + 60 * 60 * 1000
      })
    }),
    isTokenAutoRefreshEnabled: true
  });
}

