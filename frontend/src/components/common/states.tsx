import { AlertTriangle, Inbox, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ApiClientError } from '@/services/api/errors'
import { Skeleton } from '@/components/ui/skeleton'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, title, onRetry }: { error?: unknown; title?: string; onRetry?: () => void }) {
  const restricted = error instanceof ApiClientError && error.status === 403
  if (restricted) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="font-medium">This feature is not available</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don&apos;t have permission, or this feature requires a different subscription plan.
        </p>
        <UpgradeLink />
      </div>
    )
  }
  const message = error instanceof ApiClientError ? error.message : 'Something went wrong.'
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
      <p className="font-medium">{title ?? 'Unable to load data'}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export function UpgradeLink() {
  return (
    <Link to="/subscription" className="text-sm font-medium text-primary hover:underline">
      View Plans
    </Link>
  )
}
