import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { ROLE_HOME } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/lib/utils'

function Centered({ title, body, cta }: { title: string; body: string; cta: { to: string; label: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mb-6 mt-2 text-muted-foreground">{body}</p>
        <Link to={cta.to} className={cn(buttonVariants())}>
          {cta.label}
        </Link>
      </div>
    </div>
  )
}

export function SessionExpiredPage() {
  return (
    <Centered
      title="Your session has expired"
      body="For your security you were signed out. Please log in again to continue."
      cta={{ to: '/login', label: 'Login Again' }}
    />
  )
}

export function UnauthorizedPage() {
  const { role } = useSession()
  return (
    <Centered
      title="You don't have permission to access this page"
      body="Your role in the selected tuition center does not include this area."
      cta={role ? { to: ROLE_HOME[role], label: 'Go to my dashboard' } : { to: '/login', label: 'Login' }}
    />
  )
}

export function NotFoundPage() {
  return (
    <Centered
      title="Page not found"
      body="The page you are looking for doesn't exist or has moved."
      cta={{ to: '/', label: 'Go home' }}
    />
  )
}
