import { AlertCircle } from 'lucide-react'

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {message}
    </p>
  )
}
