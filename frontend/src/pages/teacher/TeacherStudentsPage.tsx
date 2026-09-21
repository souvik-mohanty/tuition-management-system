import { useMemo, useState } from 'react'
import { FilterPanel } from '@/components/common/FilterPanel'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { useBatches, useStudents, useSubjects } from '@/features/directory/queries'
import { DEMO_TEACHER_ID } from '@/services/mock/store'
import type { Student } from '@/types'

export default function TeacherStudentsPage() {
  const students = useStudents()
  const subjects = useSubjects()
  const batches = useBatches()
  const [batchFilter, setBatchFilter] = useState('')

  const myBatchIds = useMemo(
    () => new Set((subjects.data ?? []).filter((s) => s.teacherId === DEMO_TEACHER_ID).map((s) => s.batchId)),
    [subjects.data],
  )
  const batchName = (id: string | null) => (batches.data ?? []).find((b) => b.id === id)?.name ?? 'Unassigned'
  const rows = (students.data ?? []).filter((s) => s.batchId && myBatchIds.has(s.batchId) && (!batchFilter || s.batchId === batchFilter))

  const columns: Column<Student>[] = [
    { key: 'name', header: 'Student', sortValue: (s) => s.name, cell: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'batch', header: 'Batch', sortValue: (s) => batchName(s.batchId), cell: (s) => batchName(s.batchId) },
    { key: 'attendance', header: 'Attendance', sortValue: (s) => s.attendancePct, cell: (s) => `${s.attendancePct}%` },
    { key: 'syllabus', header: 'Syllabus', hideBelow: 'md', sortValue: (s) => s.syllabusPct, cell: (s) => `${s.syllabusPct}%` },
    { key: 'status', header: 'Status', cell: (s) => <StatusBadge status={s.status} /> },
  ]

  return (
    <>
      <PageHeader title="My students" description="Students in the batches you teach (read-only)." />
      <DataTable
        caption="Students"
        columns={columns}
        rows={rows}
        getRowId={(s) => s.id}
        isLoading={students.isLoading || subjects.isLoading}
        error={students.error}
        onRetry={() => students.refetch()}
        searchPlaceholder="Search students"
        searchText={(s) => s.name}
        filters={
          <FilterPanel
            filters={[
              {
                id: 'batch',
                label: 'Batches',
                value: batchFilter,
                onChange: setBatchFilter,
                options: (batches.data ?? []).filter((b) => myBatchIds.has(b.id)).map((b) => ({ value: b.id, label: b.name })),
              },
            ]}
          />
        }
        emptyTitle="No students in your batches yet."
      />
    </>
  )
}
