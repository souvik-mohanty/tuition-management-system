import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { RouteError } from '@/components/common/RouteError'
import { PageSkeleton } from '@/components/common/states'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ModulePage } from '@/pages/ModulePage'
import { RequireAuth, RequireRole } from './guards'

const HomePage = lazy(() => import('@/pages/public/HomePage'))
const FeaturesPage = lazy(() => import('@/pages/public/FeaturesPage'))
const PricingPage = lazy(() => import('@/pages/public/PricingPage'))
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SelectTuitionPage = lazy(() => import('@/pages/auth/SelectTuitionPage'))
const OwnerDashboardPage = lazy(() => import('@/pages/owner/OwnerDashboardPage'))
const TeacherDashboardPage = lazy(() => import('@/pages/teacher/TeacherDashboardPage'))
const StudentDashboardPage = lazy(() => import('@/pages/student/StudentDashboardPage'))
const ParentDashboardPage = lazy(() => import('@/pages/parent/ParentDashboardPage'))
type Page = React.LazyExoticComponent<() => React.JSX.Element>
type Impl = Record<string, Page>

const ownerImpl: Impl = {
  students: lazy(() => import('@/pages/owner/StudentsPage')),
  'students/:id': lazy(() => import('@/pages/owner/StudentDetailPage')),
  parents: lazy(() => import('@/pages/owner/ParentsPage')),
  teachers: lazy(() => import('@/pages/owner/TeachersPage')),
  'teachers/:id': lazy(() => import('@/pages/owner/TeacherDetailPage')),
  batches: lazy(() => import('@/pages/owner/BatchesPage')),
  'batches/:id': lazy(() => import('@/pages/owner/BatchDetailPage')),
  subjects: lazy(() => import('@/pages/owner/SubjectsPage')),
  classes: lazy(() => import('@/pages/owner/ClassesPage')),
}
const teacherImpl: Impl = {
  classes: lazy(() => import('@/pages/teacher/TeacherClassesPage')),
  students: lazy(() => import('@/pages/teacher/TeacherStudentsPage')),
}
const studentImpl: Impl = { classes: lazy(() => import('@/pages/student/StudentClassesPage')) }
const parentImpl: Impl = {
  children: lazy(() => import('@/pages/parent/ParentChildrenPage')),
  classes: lazy(() => import('@/pages/parent/ParentClassesPage')),
}

const SessionExpiredPage = lazy(() => import('@/pages/auth/StatusPages').then((m) => ({ default: m.SessionExpiredPage })))
const UnauthorizedPage = lazy(() => import('@/pages/auth/StatusPages').then((m) => ({ default: m.UnauthorizedPage })))
const NotFoundPage = lazy(() => import('@/pages/auth/StatusPages').then((m) => ({ default: m.NotFoundPage })))

const suspense = (node: React.ReactNode) => <Suspense fallback={<PageSkeleton />}>{node}</Suspense>

type ModuleDef = [path: string, title: string, phase: number]

const ownerModules: ModuleDef[] = [
  ['students', 'Students', 2],
  ['students/:id', 'Student Details', 2],
  ['parents', 'Parents', 2],
  ['teachers', 'Teachers', 2],
  ['teachers/:id', 'Teacher Details', 2],
  ['batches', 'Batches', 2],
  ['batches/:id', 'Batch Details', 2],
  ['subjects', 'Subjects', 2],
  ['classes', 'Classes', 2],
  ['attendance', 'Attendance', 3],
  ['syllabus', 'Syllabus', 3],
  ['assignments', 'Assignments', 3],
  ['tests', 'Tests', 3],
  ['fees', 'Fees', 4],
  ['payments', 'Payments', 4],
  ['invoices', 'Invoices', 4],
  ['teacher-payments', 'Teacher Payments', 4],
  ['wallet', 'Wallet', 4],
  ['analytics', 'Analytics', 6],
  ['notifications', 'Notifications', 6],
  ['subscription', 'Subscription', 5],
  ['settings', 'Settings', 1],
  ['profile', 'Profile', 1],
]

const teacherModules: ModuleDef[] = [
  ['classes', 'Classes', 2],
  ['students', 'Students', 2],
  ['attendance', 'Attendance', 3],
  ['syllabus', 'Syllabus', 3],
  ['assignments', 'Assignments', 3],
  ['tests', 'Tests', 3],
  ['payments', 'Payments', 4],
  ['profile', 'Profile', 1],
]

const studentModules: ModuleDef[] = [
  ['classes', 'Classes', 2],
  ['attendance', 'Attendance', 3],
  ['syllabus', 'Syllabus', 3],
  ['assignments', 'Assignments', 3],
  ['tests', 'Tests', 3],
  ['fees', 'Fees', 4],
  ['payments', 'Payments', 4],
  ['invoices', 'Invoices', 4],
  ['notifications', 'Notifications', 6],
  ['profile', 'Profile', 1],
]

const parentModules: ModuleDef[] = [
  ['children', 'Children', 2],
  ['attendance', 'Attendance', 3],
  ['classes', 'Classes', 2],
  ['syllabus', 'Syllabus', 3],
  ['assignments', 'Assignments', 3],
  ['tests', 'Tests', 3],
  ['fees', 'Fees', 4],
  ['payments', 'Payments', 4],
  ['invoices', 'Invoices', 4],
  ['notifications', 'Notifications', 6],
  ['profile', 'Profile', 1],
]

const toRoutes = (defs: ModuleDef[], impl: Impl = {}): RouteObject[] =>
  defs.map(([path, title, phase]) => {
    const Built = impl[path]
    return { path, element: Built ? suspense(<Built />) : <ModulePage title={title} phase={phase} /> }
  })

const roleSection = (
  prefix: string,
  role: 'TEACHER' | 'STUDENT' | 'PARENT',
  Dashboard: Page,
  modules: ModuleDef[],
  impl: Impl,
): RouteObject => ({
  element: <RequireRole role={role} />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { path: `${prefix}/dashboard`, element: suspense(<Dashboard />) },
        ...toRoutes(modules, impl).map((r) => ({ ...r, path: `${prefix}/${r.path}` })),
      ],
    },
  ],
})

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: suspense(<HomePage />) },
          { path: '/features', element: suspense(<FeaturesPage />) },
          { path: '/pricing', element: suspense(<PricingPage />) },
          { path: '/about', element: suspense(<AboutPage />) },
          { path: '/contact', element: suspense(<ContactPage />) },
        ],
      },
      { path: '/login', element: suspense(<LoginPage />) },
      { path: '/select-tuition', element: suspense(<SelectTuitionPage />) },
      { path: '/session-expired', element: suspense(<SessionExpiredPage />) },
      { path: '/unauthorized', element: suspense(<UnauthorizedPage />) },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <RequireRole role="OWNER" />,
            children: [
              {
                element: <DashboardLayout />,
                children: [{ path: '/dashboard', element: suspense(<OwnerDashboardPage />) }, ...toRoutes(ownerModules, ownerImpl).map((r) => ({ ...r, path: `/${r.path}` }))],
              },
            ],
          },
          roleSection('/teacher', 'TEACHER', TeacherDashboardPage, teacherModules, teacherImpl),
          roleSection('/student', 'STUDENT', StudentDashboardPage, studentModules, studentImpl),
          roleSection('/parent', 'PARENT', ParentDashboardPage, parentModules, parentImpl),
        ],
      },
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '*', element: suspense(<NotFoundPage />) },
    ],
  },
])
