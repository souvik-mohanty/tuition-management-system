import { FirebaseError } from 'firebase/app'
import { RecaptchaVerifier, signInWithPhoneNumber, signOut, type ConfirmationResult } from 'firebase/auth'
import { env } from '@/app/config/env'
import type { AuthSession } from '@/types'
import { getFirebaseAuth } from '../firebase/client'
import { delay, findMockSession, MOCK_OTP } from '../mock/db'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'

export const RECAPTCHA_CONTAINER_ID = 'recaptcha-container'
const COUNTRY_CODE = '+91'

let confirmation: ConfirmationResult | null = null
let verifier: RecaptchaVerifier | null = null

function resetVerifier() {
  verifier?.clear()
  verifier = null
}

function mapFirebaseError(e: unknown): ApiClientError {
  if (e instanceof ApiClientError) return e
  if (e instanceof FirebaseError) {
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
      default:
        return new ApiClientError(500, 'Unable to verify your number right now. Please try again.')
    }
  }
  return new ApiClientError(-1, 'Unexpected error occurred.')
}

/**
 * Real flow: Firebase sends the SMS and verifies the OTP in the browser, then the Firebase ID token is
 * exchanged with our backend, which is the authority on who may log in and issues our JWT.
 */
export async function sendOtp(phone: string): Promise<void> {
  if (env.useMockAuth) {
    if (!findMockSession(phone)) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    await delay(undefined, 600)
    return
  }
  try {
    const auth = getFirebaseAuth()
    verifier ??= new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, { size: 'invisible' })
    confirmation = await signInWithPhoneNumber(auth, `${COUNTRY_CODE}${phone}`, verifier)
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
    const session = findMockSession(phone)
    if (!session) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    return session
  }
  if (!confirmation) throw new ApiClientError(400, 'Please request an OTP first.')

  let idToken: string
  try {
    const credential = await confirmation.confirm(otp)
    idToken = await credential.user.getIdToken(true)
  } catch (e) {
    throw mapFirebaseError(e)
  }

  try {
    const { data } = await apiClient.post<AuthSession>(`${endpoints.auth}/firebase`, { idToken })
    confirmation = null
    return data
  } finally {
    // Our JWT is the session; don't keep a parallel Firebase session in the browser.
    void signOut(getFirebaseAuth())
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
