"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "./firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Инициализация reCAPTCHA
 */
export function initRecaptcha() {
  if (typeof window === "undefined") return;
  if (recaptchaVerifier) return;

  const container = document.getElementById("recaptcha-container");
  if (!container) {
    console.error("❌ recaptcha-container not found");
    return;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
    }
  );

  recaptchaVerifier.render();
}

/**
 * Email login
 */
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Email register
 */
export async function registerWithEmail(email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred;
}

/**
 * Send SMS
 */
export async function sendSmsCode(
  phone: string
): Promise<ConfirmationResult> {
  initRecaptcha();

  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized");
  }

  return signInWithPhoneNumber(auth, phone, recaptchaVerifier);
}
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserProfile(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
}

// у тебя это уже есть, но оставляю для контекста
export async function upsertUserProfile(data: any) {
  const ref = doc(db, "users", data.uid);
  await setDoc(ref, data, { merge: true });
}
