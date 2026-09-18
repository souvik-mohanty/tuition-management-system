import { env } from '@/app/config/env'
import type { AuthSession } from '@/types'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'
import { delay, findMockSession, MOCK_OTP } from '../mock/db'

/**
 * Phase 1 uses a mock OTP flow. In Phase 7 replace with Firebase phone auth:
 * Firebase verifies the OTP client-side, then the Firebase ID token is exchanged
 * with the backend for our JWT + tuition memberships.
 */
export async function sendOtp(phone: string): Promise<void> {
  if (env.useMockApi) {
    if (!findMockSession(phone)) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    await delay(undefined, 600)
    return
  }
  await apiClient.post(`${endpoints.auth}/otp/send`, { phone })
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthSession> {
  if (env.useMockApi) {
    await delay(undefined, 600)
    if (otp === '000000') throw new ApiClientError(410, 'This OTP has expired. Please request a new one.')
    if (otp !== MOCK_OTP) throw new ApiClientError(400, 'Invalid OTP. Please check and try again.')
    const session = findMockSession(phone)
    if (!session) throw new ApiClientError(404, 'This number is not registered with any tuition center.')
    return session
  }
  const { data } = await apiClient.post<AuthSession>(`${endpoints.auth}/otp/verify`, { phone, otp })
  return data
}
