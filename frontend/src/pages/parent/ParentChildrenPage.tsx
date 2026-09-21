import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/states'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress'
import { useBatches, useStudents } from '@/features/directory/queries'
import { DEMO_PARENT_ID } from '@/services/mock/store'

export default function ParentChildrenPage() {
  const students = useStudents()
  const batches = useBatches()

  if (students.isLoading) return <PageSkeleton />
  if (students.isError) {
    return (
      <Card>
        <ErrorState error={students.error} title="Unable to load your children" onRetry={() => students.refetch()} />
      </Card>
    )
  }
  const children = (students.data ?? []).filter((s) => s.parentId === DEMO_PARENT_ID)
  const batchName = (id: string | null) => (batches.data ?? []).find((b) => b.id === id)?.name ?? 'Unassigned'

  return (
    <>
      <PageHeader title="Children" description="Students linked to your account." />
      {children.length === 0 ? (
        <Card>
          <EmptyState title="No children linked to your account yet." description="Ask your tuition center to link your child." />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {children.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle>{c.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{batchName(c.batchId)}</p>
                </div>
                <StatusBadge status={c.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Attendance</span>
                    <span className="font-medium">{c.attendancePct}%</span>
                  </div>
                  <ProgressBar value={c.attendancePct} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Syllabus progress</span>
                    <span className="font-medium">{c.syllabusPct}%</span>
                  </div>
                  <ProgressBar value={c.syllabusPct} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Fee status</span>
                  <StatusBadge status={c.feeStatus} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
