import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState, PageSkeleton } from '@/components/common/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress'
import { useBatches, useParents, useStudent, useSubjects } from '@/features/directory/queries'
import { StudentFormModal } from '@/features/students/StudentFormModal'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id = '' } = useParams()
  const student = useStudent(id)
  const batches = useBatches()
  const parents = useParents()
  const subjects = useSubjects()
  const [editing, setEditing] = useState(false)

  if (student.isLoading) return <PageSkeleton />
  if (student.isError || !student.data) {
    return (
      <Card>
        <ErrorState error={student.error} title="Unable to load this student" onRetry={() => student.refetch()} />
      </Card>
    )
  }

  const s = student.data
  const batch = (batches.data ?? []).find((b) => b.id === s.batchId)
  const parent = (parents.data ?? []).find((p) => p.id === s.parentId)
  const batchSubjects = (subjects.data ?? []).filter((x) => x.batchId === s.batchId && x.status === 'ACTIVE')

  return (
    <>
      <Link to="/students" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to students
      </Link>
      <PageHeader
        title={s.name}
        description={`${batch?.name ?? 'No batch'} · Admitted ${s.admissionDate}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={s.status} />
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit student
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Phone">{s.phone}</Field>
              <Field label="Email">{s.email || '-'}</Field>
              <Field label="Date of birth">{s.dob}</Field>
              <Field label="Admission date">{s.admissionDate}</Field>
              <div className="col-span-2">
                <Field label="Address">{s.address}</Field>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent information</CardTitle>
          </CardHeader>
          <CardContent>
            {parent ? (
              <dl className="grid grid-cols-2 gap-4">
                <Field label="Name">{parent.name}</Field>
                <Field label="Phone">{parent.phone}</Field>
                <div className="col-span-2">
                  <Field label="Email">{parent.email}</Field>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No parent or guardian linked.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch and subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Batch: {batch ? <Link to={`/batches/${batch.id}`} className="font-medium text-primary hover:underline">{batch.name}</Link> : 'Unassigned'}
            </p>
            {batchSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active subjects.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {batchSubjects.map((x) => (
                  <li key={x.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {x.name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic progress and fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Attendance</span>
                <span className="font-medium">{s.attendancePct}%</span>
              </div>
              <ProgressBar value={s.attendancePct} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Syllabus progress</span>
                <span className="font-medium">{s.syllabusPct}%</span>
              </div>
              <ProgressBar value={s.syllabusPct} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Fee status</span>
              <StatusBadge status={s.feeStatus} />
            </div>
            <p className="text-xs text-muted-foreground">
              Assignments, tests, payments and invoices appear here once those modules are live.
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Created {new Date(s.createdAt).toLocaleString()} · Last updated {new Date(s.updatedAt).toLocaleString()}
      </p>

      <StudentFormModal open={editing} student={s} onClose={() => setEditing(false)} />
    </>
  )
}
