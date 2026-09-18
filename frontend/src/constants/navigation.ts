import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  Library,
  Receipt,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  UsersRound,
  Wallet,
  Banknote,
  Baby,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const ROLE_HOME: Record<Role, string> = {
  OWNER: '/dashboard',
  TEACHER: '/teacher/dashboard',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
}

export const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner / Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
}

const ownerNav: NavGroup[] = [
  { items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] },
  {
    label: 'People',
    items: [
      { label: 'Students', to: '/students', icon: GraduationCap },
      { label: 'Parents', to: '/parents', icon: UsersRound },
      { label: 'Teachers', to: '/teachers', icon: Users },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Batches', to: '/batches', icon: Layers },
      { label: 'Subjects', to: '/subjects', icon: BookOpen },
      { label: 'Classes', to: '/classes', icon: CalendarDays },
      { label: 'Attendance', to: '/attendance', icon: ClipboardCheck },
      { label: 'Syllabus', to: '/syllabus', icon: ListChecks },
      { label: 'Assignments', to: '/assignments', icon: FileText },
      { label: 'Tests', to: '/tests', icon: Library },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Fees', to: '/fees', icon: Banknote },
      { label: 'Payments', to: '/payments', icon: CreditCard },
      { label: 'Invoices', to: '/invoices', icon: Receipt },
      { label: 'Teacher Payments', to: '/teacher-payments', icon: Users },
      { label: 'Wallet', to: '/wallet', icon: Wallet },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      { label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Subscription', to: '/subscription', icon: ShieldCheck },
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Profile', to: '/profile', icon: UserCircle },
    ],
  },
]

const teacherNav: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
      { label: 'Classes', to: '/teacher/classes', icon: CalendarDays },
      { label: 'Students', to: '/teacher/students', icon: GraduationCap },
      { label: 'Attendance', to: '/teacher/attendance', icon: ClipboardCheck },
      { label: 'Syllabus', to: '/teacher/syllabus', icon: ListChecks },
      { label: 'Assignments', to: '/teacher/assignments', icon: FileText },
      { label: 'Tests', to: '/teacher/tests', icon: Library },
      { label: 'Payments', to: '/teacher/payments', icon: Banknote },
      { label: 'Profile', to: '/teacher/profile', icon: UserCircle },
    ],
  },
]

const studentNav: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Classes', to: '/student/classes', icon: CalendarDays },
      { label: 'Attendance', to: '/student/attendance', icon: ClipboardCheck },
      { label: 'Syllabus', to: '/student/syllabus', icon: ListChecks },
      { label: 'Assignments', to: '/student/assignments', icon: FileText },
      { label: 'Tests', to: '/student/tests', icon: Library },
      { label: 'Fees', to: '/student/fees', icon: Banknote },
      { label: 'Payments', to: '/student/payments', icon: CreditCard },
      { label: 'Invoices', to: '/student/invoices', icon: Receipt },
      { label: 'Notifications', to: '/student/notifications', icon: Bell },
      { label: 'Profile', to: '/student/profile', icon: UserCircle },
    ],
  },
]

const parentNav: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/parent/dashboard', icon: LayoutDashboard },
      { label: 'Children', to: '/parent/children', icon: Baby },
      { label: 'Attendance', to: '/parent/attendance', icon: ClipboardCheck },
      { label: 'Classes', to: '/parent/classes', icon: CalendarDays },
      { label: 'Syllabus', to: '/parent/syllabus', icon: ListChecks },
      { label: 'Assignments', to: '/parent/assignments', icon: FileText },
      { label: 'Tests', to: '/parent/tests', icon: Library },
      { label: 'Fees', to: '/parent/fees', icon: Banknote },
      { label: 'Payments', to: '/parent/payments', icon: CreditCard },
      { label: 'Invoices', to: '/parent/invoices', icon: Receipt },
      { label: 'Notifications', to: '/parent/notifications', icon: Bell },
      { label: 'Profile', to: '/parent/profile', icon: UserCircle },
    ],
  },
]

export const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  OWNER: ownerNav,
  TEACHER: teacherNav,
  STUDENT: studentNav,
  PARENT: parentNav,
}
