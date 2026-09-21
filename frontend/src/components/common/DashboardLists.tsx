import { EmptyState } from '@/components/common/states'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { AssignmentItem, ResultItem, ScheduleItem } from '@/types'

export function ScheduleList({ items, emptyTitle }: { items: ScheduleItem[]; emptyTitle: string }) {
  if (items.length === 0) return <EmptyState title={emptyTitle} />
  return (
    <ul className="divide-y">
      {items.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{c.title}</p>
            <p className="text-sm text-muted-foreground">
              {c.batch} · {c.subject} · {c.teacher}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.time} · {c.room}
            </p>
          </div>
          <StatusBadge status={c.status} />
        </li>
      ))}
    </ul>
  )
}

export function AssignmentList({ items }: { items: AssignmentItem[] }) {
  if (items.length === 0) return <EmptyState title="No assignments available." />
  return (
    <ul className="divide-y">
      {items.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{a.title}</p>
            <p className="text-sm text-muted-foreground">
              {a.subject} · due {a.due}
            </p>
          </div>
          <StatusBadge status={a.status} />
        </li>
      ))}
    </ul>
  )
}

export function ResultList({ items }: { items: ResultItem[] }) {
  if (items.length === 0) return <EmptyState title="No results yet." />
  return (
    <ul className="divide-y">
      {items.map((r) => {
        const pct = Math.round((r.marks / r.max) * 100)
        return (
          <li key={r.id} className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium">
                {r.subject} · {r.test}
              </p>
              <p className="text-xs text-muted-foreground">{r.date}</p>
            </div>
            <p className="text-sm">
              <span className="font-semibold">
                {r.marks}/{r.max}
              </span>{' '}
              <span className="text-muted-foreground">({pct}%)</span>
            </p>
          </li>
        )
      })}
    </ul>
  )
}
