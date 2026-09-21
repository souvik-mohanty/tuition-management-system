import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, PageSkeleton } from '@/components/common/states'
import { Card } from '@/components/ui/card'
import { ClassesView } from '@/features/classes/ClassesView'
import { useStudents } from '@/features/directory/queries'
import { DEMO_PARENT_ID } from '@/services/mock/store'

export default function ParentClassesPage() {
  const students = useStudents()
  if (students.isLoading) return <PageSkeleton />
  const batchIds = [...new Set((students.data ?? []).filter((s) => s.parentId === DEMO_PARENT_ID && s.batchId).map((s) => s.batchId!))]

  return (
    <>
      <PageHeader title="Classes" description="Class schedule for your children's batches (read-only)." />
      {batchIds.length > 0 ? (
        <ClassesView scope={{ batchIds }} canManage={false} attendancePath="/parent/attendance" />
      ) : (
        <Card>
          <EmptyState title="No children linked to your account yet." />
        </Card>
      )}
    </>
  )
}
