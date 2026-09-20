import { cn } from '@/lib/utils'

export const APP_NAME = 'Classops'

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <span className="flex items-center gap-2">
      <img src="/logo.png" alt="" width={36} height={36} className={cn('h-9 w-9 shrink-0', className)} />
      <span className={cn('text-lg font-semibold', textClassName)}>{APP_NAME}</span>
    </span>
  )
}
