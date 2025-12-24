import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For development, use a service account or emulator
    // In production, use environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    app = getApps()[0];
  }

  adminDb = getFirestore(app);
  adminAuth = getAuth(app);

  return { app, adminDb, adminAuth };
}

// Lazy initialization
export const getAdminDb = (): Firestore => {
  if (!adminDb) {
    initializeFirebaseAdmin();
  }
  return adminDb;
};

export const getAdminAuth = (): Auth => {
  if (!adminAuth) {
    initializeFirebaseAdmin();
  }
  return adminAuth;
};

// For direct usage
try {
  const result = initializeFirebaseAdmin();
  adminDb = result.adminDb;
  adminAuth = result.adminAuth;
} catch (error) {
  console.warn('Firebase Admin initialization skipped (will initialize on first use):', error);
}

export { adminDb as db, adminAuth as auth };
