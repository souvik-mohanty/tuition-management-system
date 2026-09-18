import axios from 'axios'
import { env } from '@/app/config/env'
import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'
import { normalizeError } from './errors'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  const tuitionId = useTenantStore.getState().currentTuitionId
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (tuitionId) config.headers['X-Tuition-Id'] = tuitionId
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const normalized = normalizeError(error)
    if (normalized.status === 401) {
      useAuthStore.getState().clearSession()
      useTenantStore.getState().setCurrentTuition(null)
      if (!window.location.pathname.startsWith('/session-expired')) {
        window.location.assign('/session-expired')
      }
    }
    return Promise.reject(normalized)
  },
)

export const endpoints = {
  auth: '/api/auth',
  tenants: '/api/tenants',
  students: '/api/students',
  parents: '/api/parents',
  teachers: '/api/teachers',
  batches: '/api/batches',
  subjects: '/api/subjects',
  classes: '/api/classes',
  attendance: '/api/attendance',
  syllabus: '/api/syllabus',
  assignments: '/api/assignments',
  tests: '/api/tests',
  fees: '/api/fees',
  payments: '/api/payments',
  invoices: '/api/invoices',
  wallet: '/api/wallet',
  teacherPayments: '/api/teacher-payments',
  analytics: '/api/analytics',
  notifications: '/api/notifications',
  subscriptions: '/api/subscriptions',
} as const
