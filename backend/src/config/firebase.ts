import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey
    }),
    storageBucket: env.firebase.storageBucket || undefined
  });
}

export const firebaseAuth = getAuth();
export const firestore = getFirestore();
export const storage = getStorage();
