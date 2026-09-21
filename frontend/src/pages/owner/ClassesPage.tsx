import { PageHeader } from '@/components/common/PageHeader'
import { ClassesView } from '@/features/classes/ClassesView'

export default function ClassesPage() {
  return (
    <>
      <PageHeader title="Classes" description="Schedule, reschedule and cancel classes. Teacher and batch clashes are blocked." />
      <ClassesView canManage attendancePath="/attendance" />
    </>
  )
}
