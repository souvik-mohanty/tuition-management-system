import { Construction } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'

/** Placeholder for modules scheduled in later build phases. Routing, guards and navigation are already live. */
export function ModulePage({ title, phase, description }: { title: string; phase: number; description?: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <Construction className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="font-medium">{title} is coming in Phase {phase}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This page is wired into routing, role guards and tenant context. The workflow itself is not built yet.
        </p>
      </Card>
    </>
  )
}
