import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterPanel } from '@/components/common/FilterPanel'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { errorMessage, useBatches, useSaveSubject, useSubjects, useTeachers } from '@/features/directory/queries'
import { SubjectFormModal } from '@/features/subjects/SubjectFormModal'
import { toast } from '@/store/toastStore'
import type { Subject } from '@/types'

export default function SubjectsPage() {
  const subjects = useSubjects()
  const batches = useBatches()
  const teachers = useTeachers()
  const save = useSaveSubject()
  const [batchFilter, setBatchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState<{ open: boolean; subject?: Subject }>({ open: false })
  const [toggle, setToggle] = useState<Subject | null>(null)

  const batchName = (id: string) => (batches.data ?? []).find((b) => b.id === id)?.name ?? id
  const teacherName = (id: string | null) => (id ? (teachers.data ?? []).find((t) => t.id === id)?.name ?? id : 'Unassigned')

  const rows = (subjects.data ?? []).filter(
    (s) => (!batchFilter || s.batchId === batchFilter) && (!statusFilter || s.status === statusFilter),
  )

  const columns: Column<Subject>[] = [
    { key: 'name', header: 'Subject', sortValue: (s) => s.name, cell: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'code', header: 'Code', hideBelow: 'md', sortValue: (s) => s.code, cell: (s) => s.code },
    { key: 'batch', header: 'Batch', sortValue: (s) => batchName(s.batchId), cell: (s) => batchName(s.batchId) },
    { key: 'teacher', header: 'Teacher', hideBelow: 'md', sortValue: (s) => teacherName(s.teacherId), cell: (s) => teacherName(s.teacherId) },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (s) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, subject: s })}>
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
        title="Subjects"
        description="Subjects are batch-specific: each one belongs to a batch and has one teacher."
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden /> Add subject
          </Button>
        }
      />

      <DataTable
        caption="Subjects"
        columns={columns}
        rows={rows}
        getRowId={(s) => s.id}
        isLoading={subjects.isLoading}
        error={subjects.error}
        onRetry={() => subjects.refetch()}
        searchPlaceholder="Search subject or code"
        searchText={(s) => `${s.name} ${s.code}`}
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
        emptyTitle="No subjects yet."
        emptyDescription="Add a subject to a batch."
        emptyAction={<Button onClick={() => setForm({ open: true })}>Add subject</Button>}
      />

      <SubjectFormModal open={form.open} subject={form.subject} onClose={() => setForm({ open: false })} />

      <ConfirmDialog
        open={!!toggle}
        title={toggle?.status === 'ACTIVE' ? 'Deactivate subject?' : 'Activate subject?'}
        message={
          toggle?.status === 'ACTIVE'
            ? `${toggle?.name} will no longer be offered when scheduling classes for ${batchName(toggle?.batchId ?? '')}.`
            : `${toggle?.name} will be available for scheduling again.`
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
              input: { name: toggle.name, code: toggle.code, batchId: toggle.batchId, teacherId: toggle.teacherId, status: toggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
            },
            { onSuccess: () => setToggle(null), onError: (e) => (toast.error(errorMessage(e)), setToggle(null)) },
          )
        }
      />
    </>
  )
}
