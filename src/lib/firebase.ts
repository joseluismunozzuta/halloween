"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config pública del SDK web de Firebase — no es secreta, la protegen las
// reglas de Firestore, no el secreto de estos valores.
const firebaseConfig = {
  apiKey: "AIzaSyB80YFsWjMAlk-Skb9N9Wp0vQIO-_WGYfY",
  authDomain: "halloween2026-cfb37.firebaseapp.com",
  projectId: "halloween2026-cfb37",
  storageBucket: "halloween2026-cfb37.firebasestorage.app",
  messagingSenderId: "428705743188",
  appId: "1:428705743188:web:5cedd41a4aec4de6bcc8c1",
  measurementId: "G-ZGD1GHX5RH"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// signInWithPopup (no signInWithRedirect) abre una ventana emergente para el
// login de Google y resuelve ahí mismo — la página principal nunca navega ni
// se recarga. onAuthStateChanged notifica el cambio cuando el popup cierra.
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOutUser() {
  return signOut(auth);
}
