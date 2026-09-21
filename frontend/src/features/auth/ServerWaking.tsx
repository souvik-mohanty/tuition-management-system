import { Loader2, ServerCrash } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME, Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ServerWaking({ unreachable, onRetry }: { unreachable: boolean; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" aria-label={`${APP_NAME} home`} className="mb-6 flex justify-center">
          <Logo textClassName="text-xl" />
        </Link>
        <Card className="p-6 text-center sm:p-8" role="status" aria-live="polite">
          {unreachable ? (
            <>
              <ServerCrash className="mx-auto h-10 w-10 text-destructive" aria-hidden />
              <h1 className="mt-4 text-xl font-semibold">We can&apos;t reach the server</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                It didn&apos;t respond after a couple of minutes. Check your connection and try again.
              </p>
              <Button className="mt-6" onClick={onRetry}>
                Try again
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden />
              <h1 className="mt-4 text-xl font-semibold">Waking up the server…</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The server sleeps when it&apos;s idle, so the first visit can take up to a minute. You&apos;ll be able to
                log in as soon as it&apos;s ready. Please keep this page open.
              </p>
              <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
