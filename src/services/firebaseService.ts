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
import firebaseAppletConfig from '../../firebase-applet-config.json';

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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  logTelemetryEvent('firestore_error', { errInfo }, 'firestore');
  throw new Error(JSON.stringify(errInfo));
}

// Attempt to initialize Firebase dynamically if config exists
try {
  const config = (window as any).__FIREBASE_CONFIG__ || firebaseAppletConfig;
  if (config && config.apiKey) {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
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
