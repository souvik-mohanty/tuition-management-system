import { Banknote, CalendarCheck, CalendarDays, ListChecks } from 'lucide-react'
import { useState } from 'react'
import { AssignmentList, ResultList } from '@/components/common/DashboardLists'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useParentDashboard } from '@/features/dashboard/useRoleDashboards'
import { useSession } from '@/hooks/useSession'
import { formatCurrency, greeting } from '@/utils/format'

export default function ParentDashboardPage() {
  const { user, tuitionId, tuitionName } = useSession()
  const { data, isLoading, isError, error, refetch } = useParentDashboard(tuitionId!)
  const [selectedId, setSelectedId] = useState<string>()

  const header = (
    <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`} description={`Parent · ${tuitionName ?? ''}`} />
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
  if (data.children.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState title="No children linked to your account yet." description="Ask your tuition center to link your child." />
        </Card>
      </>
    )
  }

  const child = data.children.find((c) => c.id === selectedId) ?? data.children[0]
  const [nextSubject, ...nextRest] = child.nextClass.split(', ')
  const nextWhen = nextRest.join(', ')

  return (
    <>
      {header}

      {data.children.length > 1 && (
        <div className="mb-6 max-w-xs space-y-2">
          <Label htmlFor="child">Viewing</Label>
          <select
            id="child"
            value={child.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            {data.children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.batch})
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="mb-4 text-lg font-semibold">
        {child.name} <span className="text-sm font-normal text-muted-foreground">· {child.batch}</span>
      </p>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance" value={`${child.attendancePct}%`} icon={CalendarCheck} />
        <StatCard label="Syllabus Progress" value={`${child.syllabusPct}%`} icon={ListChecks} />
        <StatCard label="Pending Fees" value={formatCurrency(child.feesPending)} icon={Banknote} />
        <StatCard label="Next Class" value={nextSubject} hint={nextWhen} icon={CalendarDays} />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentList items={child.assignments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultList items={child.results} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
