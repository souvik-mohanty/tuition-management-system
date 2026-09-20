import { FirebaseError } from 'firebase/app'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User,
} from 'firebase/auth'
import { env } from '@/app/config/env'
import type { AuthSession } from '@/types'
import { getFirebaseAuth } from '../firebase/client'
import { delay, findMockSession, MOCK_OTP } from '../mock/db'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'

export const RECAPTCHA_CONTAINER_ID = 'recaptcha-container'
// Mock accounts are keyed by 10-digit Indian numbers.
const mockKey = (e164: string) => e164.replace(/^\+91/, '')

// The free Render instance can take ~a minute to wake up, so the login exchange gets a longer timeout.
const EXCHANGE_TIMEOUT_MS = 60_000

let confirmation: ConfirmationResult | null = null
let verifiedUser: User | null = null
let verifier: RecaptchaVerifier | null = null

function clearVerification() {
  confirmation = null
  verifiedUser = null
  // Our JWT is the session; don't keep a parallel Firebase session in the browser.
  void signOut(getFirebaseAuth())
}

function resetVerifier() {
  verifier?.clear()
  verifier = null
}

function mapFirebaseError(e: unknown): ApiClientError {
  if (e instanceof ApiClientError) return e
  if (e instanceof FirebaseError) {
    console.error('[firebase auth]', e.code, e.message)
    switch (e.code) {
      case 'auth/invalid-phone-number':
        return new ApiClientError(400, 'Enter a valid mobile number.')
      case 'auth/invalid-verification-code':
        return new ApiClientError(400, 'Invalid OTP. Please check and try again.')
      case 'auth/code-expired':
      case 'auth/session-expired':
        return new ApiClientError(410, 'This OTP has expired. Please request a new one.')
      case 'auth/too-many-requests':
      case 'auth/quota-exceeded':
        return new ApiClientError(429, 'Too many attempts. Please wait a while and try again.')
      case 'auth/network-request-failed':
        return new ApiClientError(0, 'Network error. Check your connection and try again.')
      case 'auth/captcha-check-failed':
        return new ApiClientError(400, 'Verification check failed. Please refresh the page and try again.')
      case 'auth/operation-not-allowed':
        return new ApiClientError(503, 'Phone sign-in is not enabled for this app yet. Please contact support.')
      case 'auth/billing-not-enabled':
        return new ApiClientError(503, 'SMS verification is not available right now. Please contact support.')
      case 'auth/unauthorized-domain':
        return new ApiClientError(503, 'This website is not authorised for sign-in yet. Please contact support.')
      default:
        return new ApiClientError(
          500,
          'Unable to verify your number right now. Please try again.' + (import.meta.env.DEV ? ` [${e.code}]` : ''),
        )
    }
  }
  return new ApiClientError(-1, 'Unexpected error occurred.')
}

/**
 * Real flow: Firebase sends the SMS and verifies the OTP in the browser, then the Firebase ID token is
 * exchanged with our backend, which is the authority on who may log in and issues our JWT.
 */
/** `phone` is E.164 (e.g. +919000000001). */
export async function sendOtp(phone: string): Promise<void> {
  if (env.useMockAuth) {
    if (!findMockSession(mockKey(phone))) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    await delay(undefined, 600)
    return
  }
  verifiedUser = null // a new OTP starts a new verification
  try {
    const auth = getFirebaseAuth()
    verifier ??= new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: 'invisible' })
    confirmation = await signInWithPhoneNumber(auth, phone, verifier)
  } catch (e) {
    resetVerifier()
    throw mapFirebaseError(e)
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthSession> {
  if (env.useMockAuth) {
    await delay(undefined, 600)
    if (otp === '000000') throw new ApiClientError(410, 'This OTP has expired. Please request a new one.')
    if (otp !== MOCK_OTP) throw new ApiClientError(400, 'Invalid OTP. Please check and try again.')
    const session = findMockSession(mockKey(phone))
    if (!session) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    return session
  }
  if (!confirmation && !verifiedUser) throw new ApiClientError(400, 'Please request an OTP first.')

  let idToken: string
  try {
    // An OTP can only be used once. If the backend call below failed to get through, keep the verified
    // Firebase user so the retry only needs a fresh ID token, not a new OTP.
    if (!verifiedUser) {
      const credential = await confirmation!.confirm(otp)
      verifiedUser = credential.user
    }
    idToken = await verifiedUser.getIdToken(true)
  } catch (e) {
    throw mapFirebaseError(e)
  }

  try {
    const { data } = await apiClient.post<AuthSession>(
      `${endpoints.auth}/firebase`,
      { idToken },
      { timeout: EXCHANGE_TIMEOUT_MS },
    )
    clearVerification()
    return data
  } catch (e) {
    if (e instanceof ApiClientError && e.status === 0) {
      throw new ApiClientError(
        0,
        "Your number is verified, but we couldn't reach the Classops server. Please try again in a moment.",
      )
    }
    // The server answered (e.g. not registered), so this verification can't be retried.
    clearVerification()
    throw e
  }
}

/** Best-effort server-side session revocation; the local session is cleared regardless. */
export async function logoutRequest(): Promise<void> {
  if (env.useMockAuth) return
  try {
    await apiClient.post(`${endpoints.auth}/logout`)
  } catch {
    // ignore: the token expires on its own
  }
}
