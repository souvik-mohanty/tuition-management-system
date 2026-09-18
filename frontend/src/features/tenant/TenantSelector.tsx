import { useQueryClient } from '@tanstack/react-query'
import { Building2, Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLE_HOME, ROLE_LABEL } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { cn } from '@/lib/utils'
import { useTenantStore } from '@/store/tenantStore'

export function TenantSelector() {
  const { memberships, tuitionId, tuitionName } = useSession()
  const setCurrentTuition = useTenantStore((s) => s.setCurrentTuition)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const switchTo = (id: string) => {
    setOpen(false)
    if (id === tuitionId) return
    const target = memberships.find((m) => m.tuitionId === id)
    if (!target) return
    // Never mix tenant data: drop every cached query before changing context.
    queryClient.clear()
    setCurrentTuition(id)
    navigate(ROLE_HOME[target.role])
  }

  const single = memberships.length <= 1

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !single && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Current tuition center"
        disabled={single}
        className={cn(
          'flex max-w-[16rem] items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm',
          !single && 'cursor-pointer hover:bg-accent',
        )}
      >
        <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate font-medium">{tuitionName ?? 'Select tuition'}</span>
        {!single && <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Tuition centers"
          className="absolute left-0 z-50 mt-2 w-72 rounded-lg border bg-card p-1 shadow-lg"
        >
          {memberships.map((m) => (
            <li key={m.tuitionId} role="option" aria-selected={m.tuitionId === tuitionId}>
              <button
                type="button"
                onClick={() => switchTo(m.tuitionId)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.tuitionName}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_LABEL[m.role]}</span>
                </span>
                {m.tuitionId === tuitionId && <Check className="h-4 w-4 text-primary" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
