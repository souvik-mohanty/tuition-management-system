import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { env } from '@/app/config/env'
import { FormError } from '@/components/common/FormError'
import { Button } from '@/components/ui/button'
import { loginWithGoogle } from '@/services/api/auth'
import { normalizeError } from '@/services/api/errors'
import { useFinishLogin } from './useFinishLogin'

interface GoogleIdApi {
  initialize(config: { client_id: string; callback: (response: { credential: string }) => void }): void
  renderButton(element: HTMLElement, options: Record<string, string | number>): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } }
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let gisPromise: Promise<void> | null = null

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  gisPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      gisPromise = null
      script.remove()
      reject(new Error('Failed to load Google Identity Services'))
    }
    document.head.appendChild(script)
  })
  return gisPromise
}

export function GoogleSignInButton() {
  const finishLogin = useFinishLogin()
  const mutation = useMutation({ mutationFn: loginWithGoogle, onSuccess: finishLogin })
  const holder = useRef<HTMLDivElement>(null)
  const [setupError, setSetupError] = useState<string>()

  useEffect(() => {
    if (env.useMockAuth) return
    if (!env.googleClientId) {
      setSetupError('Google sign-in is not configured.')
      return
    }
    let cancelled = false
    loadGoogleIdentity()
      .then(() => {
        const el = holder.current
        if (cancelled || !el || !window.google) return
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (response) => mutation.mutate(response.credential),
        })
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: Math.min(400, el.clientWidth || 320),
        })
      })
      .catch(() => {
        if (!cancelled) setSetupError("Couldn't load Google sign-in. Check your connection and try again.")
      })
    return () => {
      cancelled = true
    }
  }, [mutation.mutate])

  const error = setupError ?? (mutation.error ? normalizeError(mutation.error).message : undefined)

  return (
    <div className="space-y-2">
      {env.useMockAuth ? (
        <Button type="button" variant="outline" className="w-full" loading={mutation.isPending} onClick={() => mutation.mutate('mock')}>
          Continue with Google (demo)
        </Button>
      ) : (
        <div
          ref={holder}
          className={mutation.isPending ? 'pointer-events-none flex min-h-11 justify-center opacity-50' : 'flex min-h-11 justify-center'}
          aria-busy={mutation.isPending}
        />
      )}
      {mutation.isPending && !env.useMockAuth && (
        <p role="status" className="text-center text-sm text-muted-foreground">
          Signing you in…
        </p>
      )}
      <FormError message={error} />
    </div>
  )
}
