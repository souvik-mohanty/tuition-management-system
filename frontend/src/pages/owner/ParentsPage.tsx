import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useBatches, useParents, useStudents } from '@/features/directory/queries'
import type { Parent } from '@/types'

export default function ParentsPage() {
  const parents = useParents()
  const students = useStudents()
  const batches = useBatches()
  const [selected, setSelected] = useState<Parent | null>(null)

  const childrenOf = (id: string) => (students.data ?? []).filter((s) => s.parentId === id)
  const batchName = (id: string | null) => (batches.data ?? []).find((b) => b.id === id)?.name ?? 'Unassigned'

  const columns: Column<Parent>[] = [
    { key: 'name', header: 'Parent', sortValue: (p) => p.name, cell: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'phone', header: 'Phone', cell: (p) => p.phone },
    { key: 'email', header: 'Email', hideBelow: 'md', cell: (p) => p.email },
    { key: 'count', header: 'Children', sortValue: (p) => childrenOf(p.id).length, cell: (p) => childrenOf(p.id).length },
    {
      key: 'children',
      header: 'Names',
      hideBelow: 'lg',
      cell: (p) => <span className="text-muted-foreground">{childrenOf(p.id).map((c) => c.name).join(', ') || '-'}</span>,
    },
    { key: 'status', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (p) => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(p)}>
          View
        </Button>
      ),
    },
  ]

  const kids = selected ? childrenOf(selected.id) : []

  return (
    <>
      <PageHeader title="Parents" description="Parents and guardians linked to your students." />

      <DataTable
        caption="Parents"
        columns={columns}
        rows={parents.data}
        getRowId={(p) => p.id}
        isLoading={parents.isLoading}
        error={parents.error}
        onRetry={() => parents.refetch()}
        searchPlaceholder="Search name, phone or email"
        searchText={(p) => `${p.name} ${p.phone} ${p.email}`}
        emptyTitle="No parents yet."
        emptyDescription="Parents appear here when you link them while adding a student."
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? 'Parent'} description="Parent profile and children">
        {selected && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium">{selected.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium">{selected.email}</dd>
              </div>
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-medium">Children ({kids.length})</h3>
              {kids.length === 0 ? (
                <p className="text-sm text-muted-foreground">No children linked.</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {kids.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                      <span>
                        <Link to={`/students/${c.id}`} className="font-medium text-primary hover:underline">
                          {c.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {batchName(c.batchId)} · Attendance {c.attendancePct}%
                        </span>
                      </span>
                      <StatusBadge status={c.feeStatus} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
