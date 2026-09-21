import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState, PageSkeleton } from '@/components/common/states'
import { Card } from '@/components/ui/card'
import { ClassesView } from '@/features/classes/ClassesView'
import { useStudents } from '@/features/directory/queries'
import { DEMO_STUDENT_ID } from '@/services/mock/store'

export default function StudentClassesPage() {
  const students = useStudents()
  if (students.isLoading) return <PageSkeleton />
  const me = (students.data ?? []).find((s) => s.id === DEMO_STUDENT_ID)

  return (
    <>
      <PageHeader title="My classes" description="Your batch's class schedule (read-only)." />
      {me?.batchId ? (
        <ClassesView scope={{ batchIds: [me.batchId] }} canManage={false} attendancePath="/student/attendance" />
      ) : (
        <Card>
          <EmptyState title="You are not assigned to a batch yet." />
        </Card>
      )}
    </>
  )
}
