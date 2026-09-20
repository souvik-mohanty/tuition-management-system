import { Link, Navigate } from 'react-router-dom'
import { APP_NAME, Logo } from '@/components/common/Logo'
import { Card } from '@/components/ui/card'
import { ROLE_HOME } from '@/constants/navigation'
import { LoginForm } from '@/features/auth/LoginForm'
import { useSession } from '@/hooks/useSession'

export default function LoginPage() {
  const { isAuthenticated, role } = useSession()
  if (isAuthenticated) return <Navigate to={role ? ROLE_HOME[role] : '/select-tuition'} replace />

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" aria-label={APP_NAME + ' home'} className="mb-6 flex justify-center">
          <Logo textClassName="text-xl" />
        </Link>
        <Card className="p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Sign in with your registered mobile number. We&apos;ll send you a one-time password.
          </p>
          <LoginForm />
        </Card>
      </div>
    </div>
  )
}
