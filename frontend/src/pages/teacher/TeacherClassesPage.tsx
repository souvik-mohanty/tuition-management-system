import { PageHeader } from '@/components/common/PageHeader'
import { ClassesView } from '@/features/classes/ClassesView'
import { DEMO_TEACHER_ID } from '@/services/mock/store'

export default function TeacherClassesPage() {
  return (
    <>
      <PageHeader title="My classes" description="Your teaching schedule. Your tuition center's admin manages the timetable." />
      <ClassesView scope={{ teacherId: DEMO_TEACHER_ID }} canManage={false} attendancePath="/teacher/attendance" />
    </>
  )
}
