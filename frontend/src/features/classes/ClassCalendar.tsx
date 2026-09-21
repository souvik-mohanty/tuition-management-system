import { addDays, format, isSameDay, isSameMonth, startOfWeek } from 'date-fns'
import { EmptyState } from '@/components/common/states'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ClassSession } from '@/types'

export type CalendarView = 'day' | 'week' | 'month'

const CHIP: Record<ClassSession['status'], string> = {
  SCHEDULED: 'bg-secondary text-secondary-foreground',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700 line-through',
}

interface Names {
  subjectName: (id: string) => string
  batchName: (id: string) => string
  teacherName: (id: string) => string
}

interface Props extends Names {
  view: CalendarView
  anchor: Date
  classes: ClassSession[]
  onSelectClass: (c: ClassSession) => void
  onSelectDay: (d: Date) => void
}

const byTime = (a: ClassSession, b: ClassSession) => a.startTime.localeCompare(b.startTime)

function Chip({
  c,
  names,
  onSelect,
  compact,
}: {
  c: ClassSession
  names: Names
  onSelect: (c: ClassSession) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(c)}
      className={cn(
        'block w-full cursor-pointer rounded px-2 py-1 text-left text-xs font-medium',
        compact && 'truncate',
        CHIP[c.status],
      )}
      title={`${c.startTime}-${c.endTime} ${names.subjectName(c.subjectId)} · ${names.batchName(c.batchId)} (${c.status})`}
    >
      {compact ? (
        <>
          {c.startTime} {names.subjectName(c.subjectId)} · {names.batchName(c.batchId)}
        </>
      ) : (
        <>
          <span className="block">
            {c.startTime} {names.subjectName(c.subjectId)}
          </span>
          <span className="block font-normal opacity-80">{names.batchName(c.batchId)}</span>
        </>
      )}
    </button>
  )
}

export function ClassCalendar({ view, anchor, classes, onSelectClass, onSelectDay, ...names }: Props) {
  const forDay = (d: Date) => classes.filter((c) => c.date === format(d, 'yyyy-MM-dd')).sort(byTime)

  if (view === 'day') {
    const items = forDay(anchor)
    if (items.length === 0) {
      return (
        <Card>
          <EmptyState title="No classes scheduled on this day." />
        </Card>
      )
    }
    return (
      <Card>
        <ul className="divide-y">
          {items.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelectClass(c)}
                className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40"
              >
                <span>
                  <span className="block font-medium">
                    {c.startTime} - {c.endTime} · {names.subjectName(c.subjectId)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {names.batchName(c.batchId)} · {names.teacherName(c.teacherId)} · {c.room}
                  </span>
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', CHIP[c.status])}>{c.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    )
  }

  if (view === 'week') {
    const start = startOfWeek(anchor, { weekStartsOn: 1 })
    return (
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((day) => {
          const items = forDay(day)
          return (
            <Card key={day.toISOString()} className={cn('p-3', isSameDay(day, new Date()) && 'border-primary')}>
              <button type="button" onClick={() => onSelectDay(day)} className="mb-2 block w-full cursor-pointer text-left">
                <p className="text-xs uppercase text-muted-foreground">{format(day, 'EEE')}</p>
                <p className="font-semibold">{format(day, 'd MMM')}</p>
              </button>
              <div className="space-y-1.5">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No classes</p>
                ) : (
                  items.map((c) => <Chip key={c.id} c={c} names={names} onSelect={onSelectClass} />)
                )}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  const gridStart = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1), { weekStartsOn: 1 })
  const weeks = 6
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/50 text-center text-xs uppercase text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i)).map((day) => {
          const items = forDay(day)
          const inMonth = isSameMonth(day, anchor)
          return (
            <div
              key={day.toISOString()}
              className={cn('min-h-24 border-b border-r p-1.5 text-xs', !inMonth && 'bg-muted/30 text-muted-foreground')}
            >
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  'mb-1 cursor-pointer rounded px-1 font-medium hover:bg-accent',
                  isSameDay(day, new Date()) && 'bg-primary text-primary-foreground hover:bg-primary',
                )}
                aria-label={`Open ${format(day, 'd MMMM')}`}
              >
                {format(day, 'd')}
              </button>
              <div className="hidden space-y-1 md:block">
                {items.slice(0, 2).map((c) => (
                  <Chip key={c.id} c={c} names={names} onSelect={onSelectClass} compact />
                ))}
                {items.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onSelectDay(day)}
                    className="cursor-pointer px-1 text-muted-foreground hover:text-foreground"
                  >
                    +{items.length - 2} more
                  </button>
                )}
              </div>
              {items.length > 0 && <p className="text-muted-foreground md:hidden">{items.length} classes</p>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
