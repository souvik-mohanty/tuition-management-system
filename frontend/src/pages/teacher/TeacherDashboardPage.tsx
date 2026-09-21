import { AlertTriangle, CalendarDays, ClipboardCheck, FileText, GraduationCap, Layers } from 'lucide-react'
import { ScheduleList } from '@/components/common/DashboardLists'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress'
import { useTeacherDashboard } from '@/features/dashboard/useRoleDashboards'
import { useSession } from '@/hooks/useSession'
import { greeting } from '@/utils/format'

export default function TeacherDashboardPage() {
  const { user, tuitionId, tuitionName } = useSession()
  const { data, isLoading, isError, error, refetch } = useTeacherDashboard(tuitionId!)

  const header = (
    <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`} description={`Teacher · ${tuitionName ?? ''}`} />
  )

  if (isLoading) return <PageSkeleton />
  if (isError || !data) {
    return (
      <>
        {header}
        <Card>
          <ErrorState error={error} title="Unable to load the dashboard" onRetry={() => refetch()} />
        </Card>
      </>
    )
  }

  const { summary, schedule, batches, attention } = data

  return (
    <>
      {header}

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Assigned Batches" value={summary.assignedBatches} icon={Layers} />
        <StatCard label="Students" value={summary.students} icon={GraduationCap} />
        <StatCard label="Today's Classes" value={summary.todaysClasses} icon={CalendarDays} />
        <StatCard label="Attendance Pending" value={summary.attendancePending} icon={ClipboardCheck} />
        <StatCard label="Submissions to Review" value={summary.submissionsToReview} icon={FileText} />
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
              <AlertTriangle className="h-4 w-4" aria-hidden /> Needs your attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <EmptyState title="You're all caught up." />
            ) : (
              <ul className="space-y-3 text-sm">
                {attention.map((a) => (
                  <li key={a.id}>{a.text}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>My Batches · Syllabus Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {batches.length === 0 ? (
              <EmptyState title="No batches assigned yet." />
            ) : (
              <ul className="grid gap-5 md:grid-cols-3">
                {batches.map((b) => (
                  <li key={b.id} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-sm text-muted-foreground">{b.students} students</p>
                    </div>
                    <ProgressBar value={b.syllabusPct} />
                    <p className="text-xs text-muted-foreground">{b.syllabusPct}% of syllabus covered</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
