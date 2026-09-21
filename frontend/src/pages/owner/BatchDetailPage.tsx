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
import { BatchFormModal } from '@/features/batches/BatchFormModal'
import {
  errorMessage,
  useBatches,
  useClasses,
  useSaveStudent,
  useSaveSubject,
  useStudents,
  useSubjects,
  useTeachers,
} from '@/features/directory/queries'
import { SubjectFormModal } from '@/features/subjects/SubjectFormModal'
import { toast } from '@/store/toastStore'
import type { Student, Subject } from '@/types'

export default function BatchDetailPage() {
  const { id = '' } = useParams()
  const batches = useBatches()
  const subjects = useSubjects()
  const teachers = useTeachers()
  const students = useStudents()
  const saveSubject = useSaveSubject()
  const saveStudent = useSaveStudent()
  const [editing, setEditing] = useState(false)
  const [addingSubject, setAddingSubject] = useState(false)
  const [addingStudents, setAddingStudents] = useState(false)
  const [pickId, setPickId] = useState('')

  const from = format(new Date(), 'yyyy-MM-dd')
  const to = format(addDays(new Date(), 6), 'yyyy-MM-dd')
  const classes = useClasses(from, to)

  if (batches.isLoading) return <PageSkeleton />
  const batch = (batches.data ?? []).find((b) => b.id === id)
  if (batches.isError || !batch) {
    return (
      <Card>
        <ErrorState error={batches.error ?? new Error('Batch not found.')} title="Unable to load this batch" onRetry={() => batches.refetch()} />
      </Card>
    )
  }

  const batchSubjects = (subjects.data ?? []).filter((s) => s.batchId === batch.id)
  const roster = (students.data ?? []).filter((s) => s.batchId === batch.id)
  const others = (students.data ?? []).filter((s) => s.batchId !== batch.id && s.status === 'ACTIVE')
  const subjectName = (sid: string) => (subjects.data ?? []).find((s) => s.id === sid)?.name ?? sid
  const teacherName = (tid: string) => (teachers.data ?? []).find((t) => t.id === tid)?.name ?? tid
  const batchName = (bid: string | null) => (batches.data ?? []).find((b) => b.id === bid)?.name ?? 'no batch'
  const upcoming = (classes.data ?? [])
    .filter((c) => c.batchId === batch.id && c.status === 'SCHEDULED')
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 8)

  const assignTeacher = (subject: Subject, teacherId: string) =>
    saveSubject.mutate(
      { id: subject.id, input: { name: subject.name, code: subject.code, batchId: subject.batchId, status: subject.status, teacherId: teacherId || null } },
      { onError: (e) => toast.error(errorMessage(e)) },
    )

  const moveStudent = (s: Student, batchId: string | null) =>
    saveStudent.mutate(
      {
        id: s.id,
        input: {
          name: s.name, phone: s.phone, email: s.email, dob: s.dob, address: s.address, parentId: s.parentId,
          admissionDate: s.admissionDate, status: s.status, batchId,
        },
      },
      {
        onSuccess: () => (setAddingStudents(false), setPickId('')),
        onError: (e) => toast.error(errorMessage(e)),
      },
    )

  return (
    <>
      <Link to="/batches" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to batches
      </Link>
      <PageHeader
        title={batch.name}
        description={`Grade ${batch.grade} · Academic year ${batch.academicYear}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={batch.status} />
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit batch
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Subjects and teachers</CardTitle>
            <Button size="sm" onClick={() => setAddingSubject(true)}>
              Add subject
            </Button>
          </CardHeader>
          <CardContent>
            {batchSubjects.length === 0 ? (
              <EmptyState title="No subjects yet." description="Add subjects for this batch." />
            ) : (
              <ul className="divide-y">
                {batchSubjects.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span>
                      <span className="font-medium">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.code}</span>
                    </span>
                    <Select
                      aria-label={`Teacher for ${s.name}`}
                      value={s.teacherId ?? ''}
                      disabled={saveSubject.isPending}
                      onChange={(e) => assignTeacher(s, e.target.value)}
                      className="h-9 w-44"
                    >
                      <option value="">Unassigned</option>
                      {(teachers.data ?? [])
                        .filter((t) => t.status === 'ACTIVE' || t.id === s.teacherId)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                    </Select>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Students ({roster.length})</CardTitle>
            <Button size="sm" onClick={() => setAddingStudents(true)} disabled={others.length === 0}>
              Add students
            </Button>
          </CardHeader>
          <CardContent>
            {roster.length === 0 ? (
              <EmptyState title="No students in this batch." />
            ) : (
              <ul className="max-h-80 divide-y overflow-y-auto">
                {roster.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    <Link to={`/students/${s.id}`} className="font-medium text-primary hover:underline">
                      {s.name}
                    </Link>
                    <span className="flex items-center gap-2">
                      <StatusBadge status={s.status} />
                      <Button variant="ghost" size="sm" disabled={saveStudent.isPending} onClick={() => moveStudent(s, null)}>
                        Remove
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Schedule (next 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            ) : upcoming.length === 0 ? (
              <EmptyState title="No classes scheduled this week." />
            ) : (
              <ul className="divide-y">
                {upcoming.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span>
                      <span className="font-medium">{subjectName(c.subjectId)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.date} · {c.startTime} - {c.endTime} · {c.room}
                      </span>
                    </span>
                    <span className="text-muted-foreground">{teacherName(c.teacherId)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <BatchFormModal open={editing} batch={batch} onClose={() => setEditing(false)} />
      <SubjectFormModal open={addingSubject} presetBatchId={batch.id} onClose={() => setAddingSubject(false)} />

      <Modal
        open={addingStudents}
        onClose={() => setAddingStudents(false)}
        title="Add student to this batch"
        description="A student belongs to one active batch, so choosing a student moves them here."
      >
        <div className="space-y-4">
          <Select aria-label="Student to add" value={pickId} onChange={(e) => setPickId(e.target.value)}>
            <option value="">Select student</option>
            {others.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (currently {batchName(s.batchId)})
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddingStudents(false)}>
              Cancel
            </Button>
            <Button
              disabled={!pickId}
              loading={saveStudent.isPending}
              onClick={() => {
                const s = others.find((x) => x.id === pickId)
                if (s) moveStudent(s, batch.id)
              }}
            >
              Move to {batch.name}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
