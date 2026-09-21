import { useEffect } from 'react'
import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CHUNK_ERROR, reloadForNewVersion } from '@/utils/chunkReload'

export function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String(error)
  const isStaleBuild = CHUNK_ERROR.test(message)

  useEffect(() => {
    if (isStaleBuild) reloadForNewVersion()
  }, [isStaleBuild])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">{isStaleBuild ? 'A new version is available' : 'Something went wrong'}</h1>
        <p className="mb-6 mt-2 text-muted-foreground">
          {isStaleBuild
            ? 'Classops was just updated. Reload the page to continue.'
            : 'An unexpected error occurred. Reloading the page usually fixes it.'}
        </p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    </div>
  )
}
