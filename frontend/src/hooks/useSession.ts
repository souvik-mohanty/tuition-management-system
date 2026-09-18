import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'

/** Current user plus the membership (tuition + role) of the selected tuition center. */
export function useSession() {
  const user = useAuthStore((s) => s.user)
  const memberships = useAuthStore((s) => s.memberships)
  const currentTuitionId = useTenantStore((s) => s.currentTuitionId)

  const membership = memberships.find((m) => m.tuitionId === currentTuitionId) ?? null

  return {
    user,
    memberships,
    membership,
    role: membership?.role ?? null,
    tuitionId: membership?.tuitionId ?? null,
    tuitionName: membership?.tuitionName ?? null,
    isAuthenticated: !!user,
  }
}
