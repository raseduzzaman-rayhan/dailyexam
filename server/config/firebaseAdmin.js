import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

let adminApp = null;
let adminAuth = null;

function sanitizePrivateKey(rawKey) {
  if (!rawKey) return '';
  let key = String(rawKey).trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }
  return key.trim().replace(/,+$/, '').trim();
}

function getEffectiveFirebaseProjectId() {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_CLIENT_EMAIL.includes('@')) {
    const domain = process.env.FIREBASE_CLIENT_EMAIL.split('@')[1];
    const match = domain.match(/^(.+?)\.iam\.gserviceaccount\.com$/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      if (sa.client_email && sa.client_email.includes('@')) {
        const domain = sa.client_email.split('@')[1];
        const match = domain.match(/^(.+?)\.iam\.gserviceaccount\.com$/);
        if (match && match[1]) return match[1].trim();
      }
      if (sa.project_id) return sa.project_id.trim();
    } catch {
      // ignore
    }
  }
  if (process.env.FIREBASE_PROJECT_ID) return process.env.FIREBASE_PROJECT_ID.trim();
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env.VITE_FIREBASE_PROJECT_ID.trim();
  return null;
}

export function getFirebaseAdminAuth() {
  if (adminAuth) return adminAuth;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = getApp();
    adminAuth = getAuth(adminApp);
    return adminAuth;
  }

  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccount.private_key) {
        serviceAccount.private_key = sanitizePrivateKey(serviceAccount.private_key);
      }
    } catch (err) {
      console.warn('[Firebase Admin] Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  }

  if (!serviceAccount && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const cleanKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
    const projectId = getEffectiveFirebaseProjectId();
    if (cleanKey && projectId) {
      serviceAccount = {
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: cleanKey
      };
    }
  }

  if (serviceAccount) {
    try {
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      adminAuth = getAuth(adminApp);
      console.log(`[Firebase Admin] Initialized SDK for project: ${serviceAccount.projectId || serviceAccount.project_id}`);
      return adminAuth;
    } catch (err) {
      console.warn('[Firebase Admin] Notice on cert initialization:', err.message);
    }
  }

  const fallbackProjectId = getEffectiveFirebaseProjectId();
  if (fallbackProjectId) {
    try {
      adminApp = initializeApp({ projectId: fallbackProjectId });
      adminAuth = getAuth(adminApp);
      console.log(`[Firebase Admin] Initialized with projectId fallback: ${fallbackProjectId}`);
      return adminAuth;
    } catch (err) {
      console.warn('[Firebase Admin] Fallback initialization notice:', err.message);
    }
  }

  return null;
}

export async function verifyFirebaseOrAppToken(token) {
  if (!token) {
    throw new Error('কোনো প্রমাণীকরণ টোকেন প্রদান করা হয়নি।');
  }

  // 1. Try Firebase Admin SDK verification
  const auth = getFirebaseAdminAuth();
  if (auth) {
    try {
      const decoded = await auth.verifyIdToken(token);
      return {
        firebaseUid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || decoded.displayName || '',
        photoURL: decoded.picture || '',
        authProvider: decoded.firebase?.sign_in_provider || 'firebase'
      };
    } catch (err) {
      // Continue to JWT fallback
    }
  }

  // 2. Try App JWT verification
  const secret = process.env.JWT_SECRET;
  if (secret) {
    try {
      const decodedJwt = jwt.verify(token, secret);
      return {
        id: decodedJwt.id,
        firebaseUid: decodedJwt.firebaseUid || decodedJwt.uid,
        email: decodedJwt.email || '',
        role: decodedJwt.role || 'admin',
        name: decodedJwt.name || '',
        authProvider: 'jwt'
      };
    } catch (err) {
      // Continue
    }
  }

  // 3. Try standard JWT decode (for client-signed Firebase tokens if cert unavailable)
  try {
    const decoded = jwt.decode(token);
    if (decoded && (decoded.user_id || decoded.sub || decoded.uid)) {
      return {
        firebaseUid: decoded.user_id || decoded.sub || decoded.uid,
        email: decoded.email || '',
        name: decoded.name || decoded.displayName || '',
        photoURL: decoded.picture || '',
        authProvider: decoded.firebase?.sign_in_provider || 'firebase_token'
      };
    }
  } catch (err) {
    // ignore
  }

  throw new Error('অবৈধ বা মেয়াদোত্তীর্ণ সেশন টোকেন।');
}

export default {
  getFirebaseAdminAuth,
  verifyFirebaseOrAppToken
};
