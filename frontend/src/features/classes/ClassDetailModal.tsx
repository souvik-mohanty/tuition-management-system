import { format, parseISO } from 'date-fns'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useStudents } from '@/features/directory/queries'
import { cn } from '@/lib/utils'
import type { ClassSession } from '@/types'

interface Props {
  session: ClassSession | null
  onClose: () => void
  names: {
    subjectName: (id: string) => string
    batchName: (id: string) => string
    teacherName: (id: string) => string
  }
  attendancePath: string
  canManage: boolean
  onEdit: (c: ClassSession) => void
  onCancel: (c: ClassSession) => void
}

export function ClassDetailModal({ session, onClose, names, attendancePath, canManage, onEdit, onCancel }: Props) {
  const students = useStudents()
  const roster = session ? (students.data ?? []).filter((s) => s.batchId === session.batchId && s.status === 'ACTIVE') : []

  return (
    <Modal open={!!session} onClose={onClose} title={session?.title ?? 'Class'} description={session ? names.subjectName(session.subjectId) : undefined}>
      {session && (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Batch</dt>
              <dd className="font-medium">{names.batchName(session.batchId)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Teacher</dt>
              <dd className="font-medium">{names.teacherName(session.teacherId)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd className="font-medium">{format(parseISO(session.date), 'EEE, d MMM yyyy')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Time</dt>
              <dd className="font-medium">
                {session.startTime} - {session.endTime}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Room</dt>
              <dd className="font-medium">{session.room}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={session.status} />
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="mb-1 text-sm font-medium">Students ({roster.length})</h3>
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active students in this batch.</p>
            ) : (
              <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                {roster.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
            {session.status !== 'CANCELLED' && (
              <Link to={attendancePath} className={cn(buttonVariants({ variant: 'outline' }))}>
                Mark attendance
              </Link>
            )}
            {canManage && session.status === 'SCHEDULED' && (
              <>
                <Button variant="outline" onClick={() => onEdit(session)}>
                  Update class
                </Button>
                <Button variant="destructive" onClick={() => onCancel(session)}>
                  Cancel class
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
