import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { AnalyticsEvent } from '../types';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseAvailable = false;

// Telemetry log buffer for Crashlytics / Analytics viewer
const telemetryLogs: AnalyticsEvent[] = [];

export function logTelemetryEvent(name: string, params: Record<string, any> = {}, type: 'analytics' | 'crashlytics' | 'firestore' = 'analytics') {
  const event: AnalyticsEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    name,
    params,
    timestamp: new Date().toLocaleTimeString(),
    type,
  };
  telemetryLogs.unshift(event);
  if (telemetryLogs.length > 50) telemetryLogs.pop();
  console.log(`[Firebase ${type.toUpperCase()}]`, name, params);
}

export function getTelemetryLogs(): AnalyticsEvent[] {
  return [...telemetryLogs];
}

// Attempt to initialize Firebase dynamically if config exists
try {
  // Check if firebase-applet-config.json exists or window fallback
  const config = (window as any).__FIREBASE_CONFIG__;
  if (config && config.apiKey) {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app, config.firestoreDatabaseId);
    isFirebaseAvailable = true;
    logTelemetryEvent('app_open', { platform: 'Android (Material 3)' }, 'analytics');
  } else {
    logTelemetryEvent('init_offline_engine', { mode: 'LocalStorage Sync' }, 'firestore');
  }
} catch (err) {
  console.warn('Firebase initialization notice:', err);
  logTelemetryEvent('firebase_init_warn', { message: String(err) }, 'crashlytics');
}

export { app, auth, db, isFirebaseAvailable };

export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'system', 'health'));
    return true;
  } catch (err) {
    logTelemetryEvent('firestore_connection_fail', { error: String(err) }, 'firestore');
    return false;
  }
}
