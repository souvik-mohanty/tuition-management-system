import { Building2 } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { ROLE_HOME, ROLE_LABEL } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { useTenantStore } from '@/store/tenantStore'

export default function SelectTuitionPage() {
  const { isAuthenticated, memberships, role } = useSession()
  const setCurrentTuition = useTenantStore((s) => s.setCurrentTuition)
  const navigate = useNavigate()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role) return <Navigate to={ROLE_HOME[role]} replace />

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-center text-xl font-semibold">Select a tuition center</h1>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
          Your account belongs to more than one tuition center. Choose where to continue.
        </p>
        <ul className="space-y-3">
          {memberships.map((m) => (
            <li key={m.tuitionId}>
              <button
                type="button"
                onClick={() => {
                  setCurrentTuition(m.tuitionId)
                  navigate(ROLE_HOME[m.role], { replace: true })
                }}
                className="w-full cursor-pointer text-left"
              >
                <Card className="flex items-center gap-3 p-4 hover:bg-accent">
                  <span className="rounded-md bg-secondary p-2 text-secondary-foreground">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{m.tuitionName}</span>
                    <span className="block text-sm text-muted-foreground">{ROLE_LABEL[m.role]}</span>
                  </span>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
