import { env } from '@/app/config/env'
import type { OwnerDashboardData } from '@/types'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'
import { delay, mockDashboardsByTenant } from '../mock/db'

export async function getOwnerDashboard(tuitionId: string): Promise<OwnerDashboardData> {
  if (env.useMockApi) {
    // Mock mode only: real (numeric) tenant ids from the backend fall back to the sample tuition's data.
    const data = mockDashboardsByTenant[tuitionId] ?? mockDashboardsByTenant.t1
    if (!data) throw new ApiClientError(404, 'No dashboard data for this tuition center.')
    return delay(data, 700)
  }
  const { data } = await apiClient.get<OwnerDashboardData>(`${endpoints.analytics}/owner-dashboard`)
  return data
}
