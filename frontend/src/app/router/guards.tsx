import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import type { Role } from '@/types'

/** Requires a logged-in user with a selected tuition center (tenant context). */
export function RequireAuth() {
  const { isAuthenticated, membership } = useSession()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!membership) return <Navigate to="/select-tuition" replace />
  return <Outlet />
}

/** UI-level routing only; the backend remains the authority on permissions. */
export function RequireRole({ role }: { role: Role }) {
  const session = useSession()
  if (session.role !== role) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
