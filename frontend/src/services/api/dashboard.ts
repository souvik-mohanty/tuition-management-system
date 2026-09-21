import { env } from '@/app/config/env'
import type { OwnerDashboardData, ParentDashboardData, StudentDashboardData, TeacherDashboardData } from '@/types'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'
import { delay, mockDashboardsByTenant } from '../mock/db'
import { mockParentDashboard, mockStudentDashboard, mockTeacherDashboard } from '../mock/roleDashboards'

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

export async function getTeacherDashboard(): Promise<TeacherDashboardData> {
  if (env.useMockApi) return delay(mockTeacherDashboard, 600)
  const { data } = await apiClient.get<TeacherDashboardData>(`${endpoints.analytics}/teacher-dashboard`)
  return data
}

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  if (env.useMockApi) return delay(mockStudentDashboard, 600)
  const { data } = await apiClient.get<StudentDashboardData>(`${endpoints.analytics}/student-dashboard`)
  return data
}

export async function getParentDashboard(): Promise<ParentDashboardData> {
  if (env.useMockApi) return delay(mockParentDashboard, 600)
  const { data } = await apiClient.get<ParentDashboardData>(`${endpoints.analytics}/parent-dashboard`)
  return data
}
