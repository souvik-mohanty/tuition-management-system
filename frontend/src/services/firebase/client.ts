import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { env } from '@/app/config/env'

let auth: Auth | null = null

/** Lazily initialised so mock mode works without any Firebase configuration. */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    if (!env.firebase.apiKey || !env.firebase.projectId) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* in your .env file.')
    }
    const app = getApps().length ? getApp() : initializeApp(env.firebase)
    auth = getAuth(app)
  }
  return auth
}
