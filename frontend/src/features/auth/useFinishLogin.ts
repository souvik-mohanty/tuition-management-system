import { useNavigate } from 'react-router-dom'
import { ROLE_HOME } from '@/constants/navigation'
import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'
import type { AuthSession } from '@/types'

/** Stores the session and routes to the right place; shared by every sign-in method. */
export function useFinishLogin() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const setCurrentTuition = useTenantStore((s) => s.setCurrentTuition)

  return (session: AuthSession) => {
    setSession(session)
    if (session.memberships.length === 1) {
      setCurrentTuition(session.memberships[0].tuitionId)
      navigate(ROLE_HOME[session.memberships[0].role], { replace: true })
    } else {
      setCurrentTuition(null)
      navigate('/select-tuition', { replace: true })
    }
  }
}
