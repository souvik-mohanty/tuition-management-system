import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { APP_NAME, Logo } from '@/components/common/Logo'
import { Card } from '@/components/ui/card'
import { ROLE_HOME } from '@/constants/navigation'
import { OTP_LOGIN_ENABLED } from '@/constants/features'
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton'
import { LoginForm } from '@/features/auth/LoginForm'
import { readSavedRole, RoleSelector, saveRole } from '@/features/auth/RoleSelector'
import { ServerWaking } from '@/features/auth/ServerWaking'
import { useServerStatus } from '@/features/auth/useServerStatus'
import { useSession } from '@/hooks/useSession'
import type { Role } from '@/types'

export default function LoginPage() {
  const { isAuthenticated, role: sessionRole } = useSession()
  const server = useServerStatus()
  const [role, setRole] = useState<Role>(readSavedRole)
  if (isAuthenticated) return <Navigate to={sessionRole ? ROLE_HOME[sessionRole] : '/select-tuition'} replace />
  if (server.state === 'waking' || server.state === 'unreachable') {
    return <ServerWaking unreachable={server.state === 'unreachable'} onRetry={server.retry} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" aria-label={APP_NAME + ' home'} className="mb-6 flex justify-center">
          <Logo textClassName="text-xl" />
        </Link>
        <Card className="p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Choose how you want to log in, then sign in with the Google account registered with your tuition center.
          </p>

          <div className="mb-4">
            <RoleSelector
              value={role}
              onChange={(r) => {
                setRole(r)
                saveRole(r)
              }}
            />
          </div>

          <GoogleSignInButton role={role} />

          <div className="my-6 flex items-center gap-3 text-xs uppercase text-muted-foreground" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          {OTP_LOGIN_ENABLED ? (
            <LoginForm />
          ) : (
            <p role="status" className="rounded-md bg-muted p-3 text-center text-sm text-muted-foreground">
              Currently OTP service is not working.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
