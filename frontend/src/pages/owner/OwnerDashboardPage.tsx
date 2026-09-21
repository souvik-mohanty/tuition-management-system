import {
  Banknote,
  BellRing,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ScheduleList } from '@/components/common/DashboardLists'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress'
import { useOwnerDashboard } from '@/features/dashboard/useOwnerDashboard'
import { useSession } from '@/hooks/useSession'
import { formatCurrency, greeting } from '@/utils/format'

export default function OwnerDashboardPage() {
  const { user, tuitionId, tuitionName } = useSession()
  const { data, isLoading, isError, error, refetch } = useOwnerDashboard(tuitionId!)

  const header = (
    <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`} description={tuitionName ?? undefined} />
  )

  if (isLoading) return <><PageSkeleton /></>
  if (isError || !data)
    return (
      <>
        {header}
        <Card>
          <ErrorState error={error} title="Unable to load the dashboard" onRetry={() => refetch()} />
        </Card>
      </>
    )

  const { summary, schedule, attendance, fees, recentPayments, upcoming, notifications } = data
  const totalMarked = attendance.present + attendance.absent + attendance.late
  const feeChart = [
    { name: 'Collected', amount: fees.collected },
    { name: 'Pending', amount: fees.pending },
    { name: 'Overdue', amount: fees.overdue },
  ]

  return (
    <>
      {header}

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={summary.totalStudents} icon={GraduationCap} />
        <StatCard label="Active Teachers" value={summary.activeTeachers} icon={Users} />
        <StatCard label="Today's Classes" value={summary.todaysClasses} icon={CalendarDays} />
        <StatCard label="Today's Attendance" value={`${summary.todaysAttendancePct}%`} icon={CalendarCheck} />
        <StatCard label="Pending Fees" value={formatCurrency(summary.pendingFees)} icon={Banknote} />
        <StatCard label="Monthly Revenue" value={formatCurrency(summary.monthlyRevenue)} icon={TrendingUp} />
        <StatCard label="Pending Teacher Payments" value={formatCurrency(summary.pendingTeacherPayments)} icon={Wallet} />
        <StatCard
          label="Subscription"
          value={<StatusBadge status={summary.subscriptionStatus} />}
          hint={`${summary.subscriptionDaysLeft} days left`}
          icon={ShieldCheck}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleList items={schedule} emptyTitle="No classes scheduled today." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-4 w-4" aria-hidden /> Recent notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <EmptyState title="No notifications." />
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p>{n.message}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/notifications" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 text-center">
              <div>
                <p className="text-xl font-semibold text-success">{attendance.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-destructive">{attendance.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-warning">{attendance.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
            <ProgressBar value={totalMarked ? (attendance.present / totalMarked) * 100 : 0} />
            <p className="text-center text-sm text-muted-foreground">{summary.todaysAttendancePct}% attendance today</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fee Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48" role="img" aria-label="Bar chart of collected, pending and overdue fees">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <EmptyState title="No payments yet." />
            ) : (
              <ul className="divide-y">
                {recentPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-medium">{p.student}</p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleList items={upcoming} emptyTitle="No upcoming classes." />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
