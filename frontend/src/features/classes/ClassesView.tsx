import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FilterPanel } from '@/components/common/FilterPanel'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState } from '@/components/common/states'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { errorMessage, useBatches, useCancelClass, useClasses, useTeachers } from '@/features/directory/queries'
import { useLookups } from '@/features/directory/useLookups'
import { cn } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import type { ClassSession } from '@/types'
import { ClassCalendar, type CalendarView } from './ClassCalendar'
import { ClassDetailModal } from './ClassDetailModal'
import { ClassFormModal } from './ClassFormModal'

interface Scope {
  batchIds?: string[]
  teacherId?: string
}

const ymd = (d: Date) => format(d, 'yyyy-MM-dd')

function rangeFor(view: CalendarView, anchor: Date) {
  if (view === 'day') return { from: anchor, to: anchor }
  if (view === 'week') return { from: startOfWeek(anchor, { weekStartsOn: 1 }), to: endOfWeek(anchor, { weekStartsOn: 1 }) }
  return {
    from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }),
    to: endOfWeek(addDays(startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }), 41), { weekStartsOn: 1 }),
  }
}

function labelFor(view: CalendarView, anchor: Date) {
  if (view === 'day') return format(anchor, 'EEEE, d MMM yyyy')
  if (view === 'week') {
    const { from, to } = rangeFor('week', anchor)
    return `${format(from, 'd MMM')} - ${format(to, 'd MMM yyyy')}`
  }
  return format(anchor, 'MMMM yyyy')
}

const step = (view: CalendarView, d: Date, dir: 1 | -1) =>
  view === 'day' ? addDays(d, dir) : view === 'week' ? addWeeks(d, dir) : addMonths(d, dir)

export function ClassesView({
  scope = {},
  canManage,
  attendancePath,
}: {
  scope?: Scope
  canManage: boolean
  attendancePath: string
}) {
  const [view, setView] = useState<CalendarView>('week')
  const [mode, setMode] = useState<'calendar' | 'list'>('calendar')
  const [anchor, setAnchor] = useState(new Date())
  const [batchFilter, setBatchFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [selected, setSelected] = useState<ClassSession | null>(null)
  const [form, setForm] = useState<{ open: boolean; session?: ClassSession; date?: string }>({ open: false })
  const [toCancel, setToCancel] = useState<ClassSession | null>(null)

  const range = rangeFor(view, anchor)
  const { data, isLoading, error, refetch } = useClasses(ymd(range.from), ymd(range.to))
  const names = useLookups()
  const batches = useBatches()
  const teachers = useTeachers()
  const cancel = useCancelClass()

  const classes = useMemo(
    () =>
      (data ?? []).filter(
        (c) =>
          (!scope.batchIds || scope.batchIds.includes(c.batchId)) &&
          (!scope.teacherId || c.teacherId === scope.teacherId) &&
          (!batchFilter || c.batchId === batchFilter) &&
          (!teacherFilter || c.teacherId === teacherFilter),
      ),
    [data, scope.batchIds, scope.teacherId, batchFilter, teacherFilter],
  )

  const columns: Column<ClassSession>[] = [
    { key: 'date', header: 'Date', cell: (c) => `${c.date}`, sortValue: (c) => `${c.date} ${c.startTime}` },
    { key: 'time', header: 'Time', cell: (c) => `${c.startTime} - ${c.endTime}` },
    { key: 'batch', header: 'Batch', cell: (c) => names.batchName(c.batchId), sortValue: (c) => names.batchName(c.batchId) },
    { key: 'subject', header: 'Subject', cell: (c) => names.subjectName(c.subjectId), sortValue: (c) => names.subjectName(c.subjectId) },
    { key: 'teacher', header: 'Teacher', cell: (c) => names.teacherName(c.teacherId), hideBelow: 'md' },
    { key: 'room', header: 'Room', cell: (c) => c.room, hideBelow: 'lg' },
    { key: 'status', header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (c) => (
        <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
          View
        </Button>
      ),
    },
  ]

  const filters = [
    ...(!scope.batchIds
      ? [
          {
            id: 'batch',
            label: 'Batches',
            value: batchFilter,
            onChange: setBatchFilter,
            options: (batches.data ?? []).map((b) => ({ value: b.id, label: b.name })),
          },
        ]
      : []),
    ...(!scope.teacherId
      ? [
          {
            id: 'teacher',
            label: 'Teachers',
            value: teacherFilter,
            onChange: setTeacherFilter,
            options: (teachers.data ?? []).map((t) => ({ value: t.id, label: t.name })),
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setAnchor(step(view, anchor, -1))} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setAnchor(step(view, anchor, 1))} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="min-w-40 font-semibold" aria-live="polite">
          {labelFor(view, anchor)}
        </p>

        <div className="inline-flex rounded-md border bg-card p-0.5" role="group" aria-label="Calendar view">
          {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                'cursor-pointer rounded px-3 py-1.5 text-sm font-medium capitalize',
                view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-md border bg-card p-0.5" role="group" aria-label="Display mode">
          <button
            type="button"
            aria-pressed={mode === 'calendar'}
            onClick={() => setMode('calendar')}
            className={cn('inline-flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-sm font-medium', mode === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
          >
            <CalendarDays className="h-4 w-4" aria-hidden /> Calendar
          </button>
          <button
            type="button"
            aria-pressed={mode === 'list'}
            onClick={() => setMode('list')}
            className={cn('inline-flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-sm font-medium', mode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
          >
            <List className="h-4 w-4" aria-hidden /> List
          </button>
        </div>

        {canManage && (
          <Button className="ml-auto" onClick={() => setForm({ open: true, date: ymd(anchor) })}>
            <Plus className="h-4 w-4" aria-hidden /> Schedule class
          </Button>
        )}
      </div>

      {filters.length > 0 && mode === 'calendar' && (
        <div className="mb-4">
          <FilterPanel filters={filters} />
        </div>
      )}

      {mode === 'list' ? (
        <DataTable
          caption="Classes"
          columns={columns}
          rows={classes}
          getRowId={(c) => c.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          filters={filters.length > 0 ? <FilterPanel filters={filters} /> : undefined}
          pageSize={10}
          emptyTitle="No classes scheduled in this period."
          emptyDescription={canManage ? 'Schedule a class to get started.' : undefined}
        />
      ) : error ? (
        <Card>
          <ErrorState error={error} title="Unable to load classes" onRetry={() => refetch()} />
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <ClassCalendar
          view={view}
          anchor={anchor}
          classes={classes}
          subjectName={names.subjectName}
          batchName={names.batchName}
          teacherName={names.teacherName}
          onSelectClass={setSelected}
          onSelectDay={(d) => {
            setAnchor(d)
            setView('day')
          }}
        />
      )}

      <ClassDetailModal
        session={selected}
        onClose={() => setSelected(null)}
        names={names}
        attendancePath={attendancePath}
        canManage={canManage}
        onEdit={(c) => {
          setSelected(null)
          setForm({ open: true, session: c })
        }}
        onCancel={(c) => {
          setSelected(null)
          setToCancel(c)
        }}
      />

      <ClassFormModal open={form.open} session={form.session} defaultDate={form.date} onClose={() => setForm({ open: false })} />

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this class?"
        message={
          toCancel
            ? `${names.subjectName(toCancel.subjectId)} for ${names.batchName(toCancel.batchId)} on ${toCancel.date} at ${toCancel.startTime} will be marked as cancelled.`
            : ''
        }
        confirmLabel="Cancel class"
        destructive
        loading={cancel.isPending}
        onClose={() => setToCancel(null)}
        onConfirm={() =>
          toCancel &&
          cancel.mutate(toCancel.id, {
            onSuccess: () => setToCancel(null),
            onError: (e) => {
              toast.error(errorMessage(e))
              setToCancel(null)
            },
          })
        }
      />
    </>
  )
}
