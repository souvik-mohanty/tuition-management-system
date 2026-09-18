import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  hint?: string
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, hint, loading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-24" />
          ) : (
            <p className="mt-1 truncate text-2xl font-semibold">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="rounded-md bg-secondary p-2 text-secondary-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Card>
  )
}
