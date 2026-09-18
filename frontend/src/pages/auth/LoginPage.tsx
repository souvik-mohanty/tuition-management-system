import { GraduationCap } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
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
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="rounded-md bg-primary p-1.5 text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xl font-semibold">TuitionSaaS</span>
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
