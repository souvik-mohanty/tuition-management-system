import type { AuthSession, OwnerDashboardData } from '@/types'

export const delay = <T>(value: T, ms = 500): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

export const MOCK_OTP = '123456'

// Clearly fictional demo accounts. Any phone not listed is treated as unregistered.
const sessions: Record<string, Omit<AuthSession, 'accessToken'>> = {
  '9000000001': {
    user: { id: 'u1', name: 'Asha Verma', phone: '9000000001', email: 'asha@example.test' },
    memberships: [
      { tuitionId: 't1', tuitionName: 'Sample Coaching Center', role: 'OWNER' },
      { tuitionId: 't2', tuitionName: 'Demo Academy', role: 'OWNER' },
    ],
  },
  '9000000002': {
    user: { id: 'u2', name: 'Rahul Nair', phone: '9000000002', email: 'rahul@example.test' },
    memberships: [
      { tuitionId: 't1', tuitionName: 'Sample Coaching Center', role: 'TEACHER' },
      { tuitionId: 't2', tuitionName: 'Demo Academy', role: 'TEACHER' },
    ],
  },
  '9000000003': {
    user: { id: 'u3', name: 'Meera Iyer', phone: '9000000003' },
    memberships: [{ tuitionId: 't1', tuitionName: 'Sample Coaching Center', role: 'STUDENT' }],
  },
  '9000000004': {
    user: { id: 'u4', name: 'Kiran Das', phone: '9000000004' },
    memberships: [{ tuitionId: 't1', tuitionName: 'Sample Coaching Center', role: 'PARENT' }],
  },
}

export function findMockSession(phone: string): AuthSession | null {
  const s = sessions[phone]
  return s ? { ...s, accessToken: `mock-jwt-${phone}` } : null
}

export const mockDashboardsByTenant: Record<string, OwnerDashboardData> = {
  t1: {
    summary: {
      totalStudents: 184,
      activeTeachers: 12,
      todaysClasses: 9,
      todaysAttendancePct: 91,
      pendingFees: 96500,
      monthlyRevenue: 412000,
      pendingTeacherPayments: 58000,
      subscriptionStatus: 'ACTIVE',
      subscriptionDaysLeft: 41,
    },
    schedule: [
      { id: 'c1', title: 'Algebra Basics', batch: 'Grade 9 A', subject: 'Mathematics', teacher: 'Rahul Nair', time: '09:00 - 10:00', room: 'Room 1', status: 'COMPLETED' },
      { id: 'c2', title: 'Motion and Force', batch: 'Grade 10 B', subject: 'Physics', teacher: 'Sunita Rao', time: '10:30 - 11:30', room: 'Room 2', status: 'ONGOING' },
      { id: 'c3', title: 'Essay Writing', batch: 'Grade 8 A', subject: 'English', teacher: 'Farah Khan', time: '12:00 - 13:00', room: 'Room 3', status: 'SCHEDULED' },
      { id: 'c4', title: 'Organic Chemistry', batch: 'Grade 12 A', subject: 'Chemistry', teacher: 'Vikram Sethi', time: '15:00 - 16:00', room: 'Lab 1', status: 'CANCELLED' },
    ],
    attendance: { present: 148, absent: 9, late: 7 },
    fees: { collected: 412000, pending: 96500, overdue: 28000 },
    recentPayments: [
      { id: 'p1', student: 'Aarav Menon', amount: 4500, date: '2026-09-17', status: 'SUCCESS' },
      { id: 'p2', student: 'Diya Kapoor', amount: 3000, date: '2026-09-17', status: 'SUCCESS' },
      { id: 'p3', student: 'Ishaan Roy', amount: 4500, date: '2026-09-16', status: 'PENDING' },
      { id: 'p4', student: 'Naina Joshi', amount: 6000, date: '2026-09-15', status: 'FAILED' },
    ],
    upcoming: [
      { id: 'c5', title: 'Trigonometry', batch: 'Grade 10 A', subject: 'Mathematics', teacher: 'Rahul Nair', time: 'Tomorrow 09:00', room: 'Room 1', status: 'SCHEDULED' },
      { id: 'c6', title: 'Cell Biology', batch: 'Grade 9 B', subject: 'Biology', teacher: 'Anita Bose', time: 'Tomorrow 11:00', room: 'Room 4', status: 'SCHEDULED' },
    ],
    notifications: [
      { id: 'n1', message: 'Fee payment received from Aarav Menon', time: '2h ago' },
      { id: 'n2', message: '3 students absent today', time: '4h ago' },
      { id: 'n3', message: 'Class scheduled for tomorrow: Trigonometry', time: 'Yesterday' },
    ],
  },
  t2: {
    summary: {
      totalStudents: 62,
      activeTeachers: 5,
      todaysClasses: 4,
      todaysAttendancePct: 88,
      pendingFees: 21000,
      monthlyRevenue: 118000,
      pendingTeacherPayments: 15000,
      subscriptionStatus: 'TRIAL',
      subscriptionDaysLeft: 6,
    },
    schedule: [
      { id: 'd1', title: 'Kinematics', batch: 'Grade 12 B', subject: 'Physics', teacher: 'Rahul Nair', time: '16:00 - 17:00', room: 'Room A', status: 'SCHEDULED' },
    ],
    attendance: { present: 49, absent: 4, late: 2 },
    fees: { collected: 118000, pending: 21000, overdue: 0 },
    recentPayments: [{ id: 'p9', student: 'Tara Bhat', amount: 3500, date: '2026-09-16', status: 'SUCCESS' }],
    upcoming: [],
    notifications: [{ id: 'n9', message: 'Subscription trial ends in 6 days', time: '1d ago' }],
  },
}
