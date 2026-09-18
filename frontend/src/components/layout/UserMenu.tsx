import { useQueryClient } from '@tanstack/react-query'
import { LogOut, UserCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLE_LABEL } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'

export function UserMenu() {
  const { user, role } = useSession()
  const clearSession = useAuthStore((s) => s.clearSession)
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

  const logout = () => {
    queryClient.clear()
    clearSession()
    setCurrentTuition(null)
    navigate('/login', { replace: true })
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
        className="flex cursor-pointer items-center gap-2 rounded-full p-1 hover:bg-accent"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-card p-1 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{role ? ROLE_LABEL[role] : ''}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              navigate(role === 'OWNER' ? '/profile' : `/${role?.toLowerCase()}/profile`)
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <UserCircle className="h-4 w-4" aria-hidden /> Profile
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Logout
          </button>
        </div>
      )}
    </div>
  )
}
