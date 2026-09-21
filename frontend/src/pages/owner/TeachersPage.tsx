import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { errorMessage, useBatches, useSetTeacherStatus, useSubjects, useTeachers } from '@/features/directory/queries'
import { TeacherFormModal } from '@/features/teachers/TeacherFormModal'
import { toast } from '@/store/toastStore'
import type { Teacher } from '@/types'

export default function TeachersPage() {
  const teachers = useTeachers()
  const subjects = useSubjects()
  const batches = useBatches()
  const setStatus = useSetTeacherStatus()
  const [form, setForm] = useState<{ open: boolean; teacher?: Teacher }>({ open: false })
  const [toggle, setToggle] = useState<Teacher | null>(null)

  const taught = (id: string) => (subjects.data ?? []).filter((s) => s.teacherId === id && s.status === 'ACTIVE')
  const batchName = (id: string) => (batches.data ?? []).find((b) => b.id === id)?.name ?? id

  const columns: Column<Teacher>[] = [
    {
      key: 'name',
      header: 'Teacher',
      sortValue: (t) => t.name,
      cell: (t) => (
        <Link to={`/teachers/${t.id}`} className="font-medium text-primary hover:underline">
          {t.name}
        </Link>
      ),
    },
    { key: 'phone', header: 'Phone', hideBelow: 'md', cell: (t) => t.phone },
    { key: 'email', header: 'Email', hideBelow: 'lg', cell: (t) => t.email },
    {
      key: 'subjects',
      header: 'Subjects',
      hideBelow: 'md',
      cell: (t) => <span className="text-muted-foreground">{[...new Set(taught(t.id).map((s) => s.name))].join(', ') || '-'}</span>,
    },
    {
      key: 'batches',
      header: 'Assigned batches',
      hideBelow: 'lg',
      cell: (t) => <span className="text-muted-foreground">{[...new Set(taught(t.id).map((s) => batchName(s.batchId)))].join(', ') || '-'}</span>,
    },
    { key: 'classes', header: 'Subjects taught', hideBelow: 'md', sortValue: (t) => taught(t.id).length, cell: (t) => taught(t.id).length },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, cell: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (t) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, teacher: t })}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setToggle(t)}>
            {t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Manage teachers and see what they teach."
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden /> Add teacher
          </Button>
        }
      />

      <DataTable
        caption="Teachers"
        columns={columns}
        rows={teachers.data}
        getRowId={(t) => t.id}
        isLoading={teachers.isLoading}
        error={teachers.error}
        onRetry={() => teachers.refetch()}
        searchPlaceholder="Search name, phone or email"
        searchText={(t) => `${t.name} ${t.phone} ${t.email}`}
        emptyTitle="No teachers found."
        emptyDescription="Add your first teacher."
        emptyAction={<Button onClick={() => setForm({ open: true })}>Add teacher</Button>}
      />

      <TeacherFormModal open={form.open} teacher={form.teacher} onClose={() => setForm({ open: false })} />

      <ConfirmDialog
        open={!!toggle}
        title={toggle?.status === 'ACTIVE' ? 'Deactivate teacher?' : 'Activate teacher?'}
        message={
          toggle?.status === 'ACTIVE'
            ? `${toggle?.name} will no longer be offered when scheduling classes.`
            : `${toggle?.name} will be available for scheduling again.`
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
