import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BatchFormModal } from '@/features/batches/BatchFormModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { errorMessage, useBatches, useSaveBatch, useStudents, useSubjects } from '@/features/directory/queries'
import { toast } from '@/store/toastStore'
import type { Batch } from '@/types'

export default function BatchesPage() {
  const batches = useBatches()
  const students = useStudents()
  const subjects = useSubjects()
  const save = useSaveBatch()
  const [form, setForm] = useState<{ open: boolean; batch?: Batch }>({ open: false })
  const [toggle, setToggle] = useState<Batch | null>(null)

  const studentCount = (id: string) => (students.data ?? []).filter((s) => s.batchId === id && s.status === 'ACTIVE').length
  const subjectsOf = (id: string) => (subjects.data ?? []).filter((s) => s.batchId === id && s.status === 'ACTIVE')
  const teacherCount = (id: string) => new Set(subjectsOf(id).map((s) => s.teacherId).filter(Boolean)).size

  const columns: Column<Batch>[] = [
    {
      key: 'name',
      header: 'Batch',
      sortValue: (b) => b.name,
      cell: (b) => (
        <Link to={`/batches/${b.id}`} className="font-medium text-primary hover:underline">
          {b.name}
        </Link>
      ),
    },
    { key: 'grade', header: 'Class', hideBelow: 'md', sortValue: (b) => Number(b.grade), cell: (b) => `Grade ${b.grade}` },
    { key: 'year', header: 'Academic year', hideBelow: 'md', cell: (b) => b.academicYear },
    { key: 'subjects', header: 'Subjects', hideBelow: 'md', sortValue: (b) => subjectsOf(b.id).length, cell: (b) => subjectsOf(b.id).length },
    { key: 'teachers', header: 'Teachers', hideBelow: 'md', cell: (b) => teacherCount(b.id) },
    { key: 'students', header: 'Students', sortValue: (b) => studentCount(b.id), cell: (b) => studentCount(b.id) },
    { key: 'status', header: 'Status', sortValue: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (b) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, batch: b })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setToggle(b)}>
            {b.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Batches"
        description="Group students by class and academic year, then attach subjects and teachers."
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden /> Create batch
          </Button>
        }
      />

      <DataTable
        caption="Batches"
        columns={columns}
        rows={batches.data}
        getRowId={(b) => b.id}
        isLoading={batches.isLoading}
        error={batches.error}
        onRetry={() => batches.refetch()}
        searchPlaceholder="Search batches"
        searchText={(b) => `${b.name} grade ${b.grade} ${b.academicYear}`}
        emptyTitle="No batches yet."
        emptyDescription="Create your first batch."
        emptyAction={<Button onClick={() => setForm({ open: true })}>Create batch</Button>}
      />

      <BatchFormModal open={form.open} batch={form.batch} onClose={() => setForm({ open: false })} />

      <ConfirmDialog
        open={!!toggle}
        title={toggle?.status === 'ACTIVE' ? 'Deactivate batch?' : 'Activate batch?'}
        message={
          toggle?.status === 'ACTIVE'
            ? `${toggle?.name} will no longer be offered when adding students or scheduling classes.`
            : `${toggle?.name} will be available again.`
        }
        confirmLabel={toggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        destructive={toggle?.status === 'ACTIVE'}
        loading={save.isPending}
        onClose={() => setToggle(null)}
        onConfirm={() =>
          toggle &&
          save.mutate(
            {
              id: toggle.id,
              input: { name: toggle.name, grade: toggle.grade, academicYear: toggle.academicYear, status: toggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
            },
            { onSuccess: () => setToggle(null), onError: (e) => (toast.error(errorMessage(e)), setToggle(null)) },
          )
        }
      />
    </>
  )
}
