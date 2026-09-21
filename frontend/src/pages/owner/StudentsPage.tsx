import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterPanel } from '@/components/common/FilterPanel'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { errorMessage, useBatches, useParents, useSetStudentStatus, useStudents, useSubjects } from '@/features/directory/queries'
import { StudentFormModal } from '@/features/students/StudentFormModal'
import { toast } from '@/store/toastStore'
import type { Student } from '@/types'

export default function StudentsPage() {
  const students = useStudents()
  const batches = useBatches()
  const parents = useParents()
  const subjects = useSubjects()
  const setStatus = useSetStudentStatus()

  const [batchFilter, setBatchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState<{ open: boolean; student?: Student }>({ open: false })
  const [toggle, setToggle] = useState<Student | null>(null)

  const batchName = useMemo(() => new Map((batches.data ?? []).map((b) => [b.id, b.name])), [batches.data])
  const parentName = useMemo(() => new Map((parents.data ?? []).map((p) => [p.id, p.name])), [parents.data])
  const subjectsOf = (batchId: string | null) =>
    (subjects.data ?? []).filter((s) => s.batchId === batchId && s.status === 'ACTIVE').map((s) => s.name)

  const rows = (students.data ?? []).filter(
    (s) => (!batchFilter || s.batchId === batchFilter) && (!statusFilter || s.status === statusFilter),
  )

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Student',
      sortValue: (s) => s.name,
      cell: (s) => (
        <Link to={`/students/${s.id}`} className="font-medium text-primary hover:underline">
          {s.name}
        </Link>
      ),
    },
    { key: 'parent', header: 'Parent', hideBelow: 'md', cell: (s) => (s.parentId ? parentName.get(s.parentId) ?? '-' : '-') },
    { key: 'phone', header: 'Phone', hideBelow: 'lg', cell: (s) => s.phone },
    { key: 'batch', header: 'Batch', sortValue: (s) => batchName.get(s.batchId ?? '') ?? '', cell: (s) => batchName.get(s.batchId ?? '') ?? 'Unassigned' },
    {
      key: 'subjects',
      header: 'Subjects',
      hideBelow: 'lg',
      cell: (s) => <span className="text-muted-foreground">{subjectsOf(s.batchId).join(', ') || '-'}</span>,
    },
    { key: 'attendance', header: 'Attendance', hideBelow: 'md', sortValue: (s) => s.attendancePct, cell: (s) => `${s.attendancePct}%` },
    { key: 'fees', header: 'Fees', hideBelow: 'md', cell: (s) => <StatusBadge status={s.feeStatus} /> },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (s) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, student: s })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setToggle(s)}>
            {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Students"
        description="Add, edit and manage the students of this tuition center."
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden /> Add student
          </Button>
        }
      />

      <DataTable
        caption="Students"
        columns={columns}
        rows={rows}
        getRowId={(s) => s.id}
        isLoading={students.isLoading}
        error={students.error}
        onRetry={() => students.refetch()}
        searchPlaceholder="Search name, phone or email"
        searchText={(s) => `${s.name} ${s.phone} ${s.email} ${parentName.get(s.parentId ?? '') ?? ''}`}
        filters={
          <FilterPanel
            filters={[
              {
                id: 'batch',
                label: 'Batches',
                value: batchFilter,
                onChange: setBatchFilter,
                options: (batches.data ?? []).map((b) => ({ value: b.id, label: b.name })),
              },
              {
                id: 'status',
                label: 'Statuses',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ],
              },
            ]}
          />
        }
        emptyTitle="No students found."
        emptyDescription="Add your first student."
        emptyAction={<Button onClick={() => setForm({ open: true })}>Add student</Button>}
      />

      <StudentFormModal open={form.open} student={form.student} onClose={() => setForm({ open: false })} />

      <ConfirmDialog
        open={!!toggle}
        title={toggle?.status === 'ACTIVE' ? 'Deactivate student?' : 'Activate student?'}
        message={
          toggle?.status === 'ACTIVE'
            ? `${toggle?.name} will be marked inactive and left out of attendance and fee runs.`
            : `${toggle?.name} will be marked active again.`
        }
        confirmLabel={toggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        destructive={toggle?.status === 'ACTIVE'}
        loading={setStatus.isPending}
        onClose={() => setToggle(null)}
        onConfirm={() =>
          toggle &&
          setStatus.mutate(
            { id: toggle.id, status: toggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
            { onSuccess: () => setToggle(null), onError: (e) => (toast.error(errorMessage(e)), setToggle(null)) },
          )
        }
      />
    </>
  )
}
