import { useCallback, useEffect, useState } from 'react'
import { env } from '@/app/config/env'
import { pingServer } from '@/services/api/health'

export type ServerState = 'checking' | 'waking' | 'ready' | 'unreachable'

const SHOW_WAKING_AFTER_MS = 1200
const RETRY_EVERY_MS = 3000
const GIVE_UP_AFTER_MS = 120_000

/**
 * Wakes the backend as soon as the login page opens. Free hosting puts the server to sleep when idle, so the first
 * request can take up to a minute; this keeps polling until it answers instead of letting the login itself time out.
 */
export function useServerStatus() {
  const [state, setState] = useState<ServerState>(env.useMockAuth ? 'ready' : 'checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (env.useMockAuth) return
    let cancelled = false
    const startedAt = Date.now()
    setState('checking')

    const wakingTimer = setTimeout(() => {
      if (!cancelled) setState((s) => (s === 'checking' ? 'waking' : s))
    }, SHOW_WAKING_AFTER_MS)

    ;(async () => {
      while (!cancelled) {
        if (await pingServer()) {
          if (!cancelled) setState('ready')
          return
        }
        if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          if (!cancelled) setState('unreachable')
          return
        }
        await new Promise((r) => setTimeout(r, RETRY_EVERY_MS))
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(wakingTimer)
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { state, retry }
}
