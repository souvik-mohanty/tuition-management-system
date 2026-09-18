import { useQuery } from '@tanstack/react-query'
import { getOwnerDashboard } from '@/services/api/dashboard'

export function useOwnerDashboard(tuitionId: string) {
  return useQuery({
    // tuitionId in the key keeps each tenant's data in a separate cache entry.
    queryKey: ['tenant', tuitionId, 'owner-dashboard'],
    queryFn: () => getOwnerDashboard(tuitionId),
  })
}
