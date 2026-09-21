import { addDays, format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/states'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { errorMessage, useBatches, useClasses, useSaveSubject, useSubjects, useTeacher } from '@/features/directory/queries'
import { TeacherFormModal } from '@/features/teachers/TeacherFormModal'
import { toast } from '@/store/toastStore'
import type { Subject } from '@/types'

export default function TeacherDetailPage() {
  const { id = '' } = useParams()
  const teacher = useTeacher(id)
  const subjects = useSubjects()
  const batches = useBatches()
  const save = useSaveSubject()
  const [editing, setEditing] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [pickId, setPickId] = useState('')

  const from = format(new Date(), 'yyyy-MM-dd')
  const to = format(addDays(new Date(), 13), 'yyyy-MM-dd')
  const classes = useClasses(from, to)

  if (teacher.isLoading) return <PageSkeleton />
  if (teacher.isError || !teacher.data) {
    return (
      <Card>
        <ErrorState error={teacher.error} title="Unable to load this teacher" onRetry={() => teacher.refetch()} />
      </Card>
    )
  }

  const t = teacher.data
  const batchName = (bid: string) => (batches.data ?? []).find((b) => b.id === bid)?.name ?? bid
  const subjectName = (sid: string) => (subjects.data ?? []).find((s) => s.id === sid)?.name ?? sid
  const assigned = (subjects.data ?? []).filter((s) => s.teacherId === t.id)
  const assignable = (subjects.data ?? []).filter((s) => s.teacherId !== t.id && s.status === 'ACTIVE')
  const upcoming = (classes.data ?? [])
    .filter((c) => c.teacherId === t.id && c.status === 'SCHEDULED')
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 8)

  const reassign = (subject: Subject, teacherId: string | null, done?: () => void) =>
    save.mutate(
      { id: subject.id, input: { name: subject.name, code: subject.code, batchId: subject.batchId, status: subject.status, teacherId } },
      { onSuccess: done, onError: (e) => toast.error(errorMessage(e)) },
    )

  return (
    <>
      <Link to="/teachers" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to teachers
      </Link>
      <PageHeader
        title={t.name}
        description={`${t.phone} · ${t.email}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={t.status} />
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit teacher
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Subjects and batches</CardTitle>
            <Button size="sm" onClick={() => setAssigning(true)} disabled={assignable.length === 0}>
              Assign subject
            </Button>
          </CardHeader>
          <CardContent>
            {assigned.length === 0 ? (
              <EmptyState title="No subjects assigned yet." description="Assign a subject so this teacher can be scheduled." />
            ) : (
              <ul className="divide-y">
                {assigned.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span>
                      <span className="font-medium">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {batchName(s.batchId)} · {s.code}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={s.status} />
                      <Button variant="ghost" size="sm" disabled={save.isPending} onClick={() => reassign(s, null)}>
                        Unassign
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule (next 14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            ) : upcoming.length === 0 ? (
              <EmptyState title="No upcoming classes." />
            ) : (
              <ul className="divide-y">
                {upcoming.map((c) => (
                  <li key={c.id} className="py-3 text-sm">
                    <p className="font-medium">
                      {subjectName(c.subjectId)} · {batchName(c.batchId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.date} · {c.startTime} - {c.endTime} · {c.room}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Created {new Date(t.createdAt).toLocaleString()} · Last updated {new Date(t.updatedAt).toLocaleString()}. Payment history
        appears here once teacher payments are live.
      </p>

      <TeacherFormModal open={editing} teacher={t} onClose={() => setEditing(false)} />

      <Modal open={assigning} onClose={() => setAssigning(false)} title="Assign a subject" description={`Choose a subject for ${t.name} to teach.`}>
        <div className="space-y-4">
          <Select aria-label="Subject to assign" value={pickId} onChange={(e) => setPickId(e.target.value)}>
            <option value="">Select subject</option>
            {assignable.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {batchName(s.batchId)}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigning(false)}>
              Cancel
            </Button>
            <Button
              disabled={!pickId}
              loading={save.isPending}
              onClick={() => {
                const subject = assignable.find((s) => s.id === pickId)
                if (subject) reassign(subject, t.id, () => (setAssigning(false), setPickId('')))
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
