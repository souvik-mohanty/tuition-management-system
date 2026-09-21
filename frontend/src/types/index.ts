export type Role = 'OWNER' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatarUrl?: string
}

export interface TuitionMembership {
  tuitionId: string
  tuitionName: string
  role: Role
}

export interface Tenant {
  id: string
  name: string
}

export interface Child {
  id: string
  name: string
  batch: string
}

export interface AuthSession {
  accessToken: string
  user: User
  memberships: TuitionMembership[]
}

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING'

export interface OwnerDashboardData {
  summary: {
    totalStudents: number
    activeTeachers: number
    todaysClasses: number
    todaysAttendancePct: number
    pendingFees: number
    monthlyRevenue: number
    pendingTeacherPayments: number
    subscriptionStatus: SubscriptionStatus
    subscriptionDaysLeft: number
  }
  schedule: ScheduleItem[]
  attendance: { present: number; absent: number; late: number }
  fees: { collected: number; pending: number; overdue: number }
  recentPayments: { id: string; student: string; amount: number; date: string; status: 'SUCCESS' | 'PENDING' | 'FAILED' }[]
  upcoming: ScheduleItem[]
  notifications: { id: string; message: string; time: string }[]
}

export interface ScheduleItem {
  id: string
  title: string
  batch: string
  subject: string
  teacher: string
  time: string
  room: string
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
}

export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}

export interface ProgressItem {
  name: string
  progress: number
}

export interface AssignmentItem {
  id: string
  title: string
  subject: string
  due: string
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
}

export interface ResultItem {
  id: string
  test: string
  subject: string
  marks: number
  max: number
  date: string
}

export interface TeacherDashboardData {
  summary: {
    assignedBatches: number
    students: number
    todaysClasses: number
    attendancePending: number
    submissionsToReview: number
  }
  schedule: ScheduleItem[]
  batches: { id: string; name: string; students: number; syllabusPct: number }[]
  attention: { id: string; text: string }[]
}

export interface StudentDashboardData {
  batch: string
  summary: { attendancePct: number; syllabusPct: number; pendingAssignments: number; pendingFees: number }
  upcoming: ScheduleItem[]
  subjects: ProgressItem[]
  assignments: AssignmentItem[]
  results: ResultItem[]
}

export interface ChildOverview {
  id: string
  name: string
  batch: string
  attendancePct: number
  syllabusPct: number
  feesPending: number
  nextClass: string
  assignments: AssignmentItem[]
  results: ResultItem[]
}

export interface ParentDashboardData {
  children: ChildOverview[]
}

// ---- Phase 2: people, academics and scheduling ----

export type ActiveStatus = 'ACTIVE' | 'INACTIVE'
export type FeeStatus = 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE'
export type ClassStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface Student {
  id: string
  name: string
  phone: string
  email: string
  dob: string
  address: string
  parentId: string | null
  batchId: string | null
  admissionDate: string
  status: ActiveStatus
  attendancePct: number
  syllabusPct: number
  feeStatus: FeeStatus
  createdAt: string
  updatedAt: string
}

export interface Parent {
  id: string
  name: string
  phone: string
  email: string
  status: ActiveStatus
}

export interface Teacher {
  id: string
  name: string
  phone: string
  email: string
  status: ActiveStatus
  createdAt: string
  updatedAt: string
}

export interface Batch {
  id: string
  name: string
  grade: string
  academicYear: string
  status: ActiveStatus
}

/** A subject belongs to exactly one batch and is taught by one teacher (batch-specific, per the PRD). */
export interface Subject {
  id: string
  name: string
  code: string
  batchId: string
  teacherId: string | null
  status: ActiveStatus
}

export interface ClassSession {
  id: string
  title: string
  batchId: string
  subjectId: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
  room: string
  status: ClassStatus
}

export type StudentInput = Omit<Student, 'id' | 'attendancePct' | 'syllabusPct' | 'feeStatus' | 'createdAt' | 'updatedAt'>
export type TeacherInput = Pick<Teacher, 'name' | 'phone' | 'email' | 'status'>
export type BatchInput = Omit<Batch, 'id'>
export type SubjectInput = Omit<Subject, 'id'>
export type ClassInput = Omit<ClassSession, 'id' | 'status'>
