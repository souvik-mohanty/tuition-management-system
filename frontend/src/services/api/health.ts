import { env } from '@/app/config/env'

/** True when the backend answers its public liveness probe. A sleeping Render instance hangs or errors until it is up. */
export async function pingServer(timeoutMs = 8000): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${env.apiBaseUrl}/actuator/health/liveness`, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) return false
    const body: unknown = await res.json()
    return typeof body === 'object' && body !== null && (body as { status?: string }).status === 'UP'
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
