import { Banknote, CalendarCheck, FileText, ListChecks } from 'lucide-react'
import { AssignmentList, ResultList, ScheduleList } from '@/components/common/DashboardLists'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { ErrorState, PageSkeleton } from '@/components/common/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress'
import { useStudentDashboard } from '@/features/dashboard/useRoleDashboards'
import { useSession } from '@/hooks/useSession'
import { formatCurrency, greeting } from '@/utils/format'

export default function StudentDashboardPage() {
  const { user, tuitionId, tuitionName } = useSession()
  const { data, isLoading, isError, error, refetch } = useStudentDashboard(tuitionId!)

  const header = (
    <PageHeader
      title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`}
      description={`Student · ${data?.batch ?? ''} · ${tuitionName ?? ''}`}
    />
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

  const { summary, upcoming, subjects, assignments, results } = data

  return (
    <>
      {header}

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance" value={`${summary.attendancePct}%`} icon={CalendarCheck} />
        <StatCard label="Syllabus Progress" value={`${summary.syllabusPct}%`} icon={ListChecks} />
        <StatCard label="Pending Assignments" value={summary.pendingAssignments} icon={FileText} />
        <StatCard label="Pending Fees" value={formatCurrency(summary.pendingFees)} icon={Banknote} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleList items={upcoming} emptyTitle="No upcoming classes." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Syllabus Progress by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {subjects.map((s) => (
                <li key={s.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentList items={assignments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultList items={results} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
