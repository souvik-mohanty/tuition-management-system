import { env } from '@/app/config/env'
import type { OwnerDashboardData } from '@/types'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'
import { delay, mockDashboardsByTenant } from '../mock/db'

export async function getOwnerDashboard(tuitionId: string): Promise<OwnerDashboardData> {
  if (env.useMockApi) {
    const data = mockDashboardsByTenant[tuitionId]
    if (!data) throw new ApiClientError(404, 'No dashboard data for this tuition center.')
    return delay(data, 700)
  }
  const { data } = await apiClient.get<OwnerDashboardData>(`${endpoints.analytics}/owner-dashboard`)
  return data
}
