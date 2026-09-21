import { useQuery } from '@tanstack/react-query'
import { getParentDashboard, getStudentDashboard, getTeacherDashboard } from '@/services/api/dashboard'

// The tuition id in every key keeps each tenant's data in a separate cache entry.
export const useTeacherDashboard = (tuitionId: string) =>
  useQuery({ queryKey: ['tenant', tuitionId, 'teacher-dashboard'], queryFn: getTeacherDashboard })

export const useStudentDashboard = (tuitionId: string) =>
  useQuery({ queryKey: ['tenant', tuitionId, 'student-dashboard'], queryFn: getStudentDashboard })

export const useParentDashboard = (tuitionId: string) =>
  useQuery({ queryKey: ['tenant', tuitionId, 'parent-dashboard'], queryFn: getParentDashboard })
