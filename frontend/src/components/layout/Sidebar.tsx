import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { NAV_BY_ROLE, type NavGroup } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

function GroupSection({ group, onNavigate }: { group: NavGroup; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const containsActive = group.items.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
  const [open, setOpen] = useState(true)
  const expanded = !group.label || open || containsActive

  return (
    <div className="mb-2">
      {group.label && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={expanded}
          className="flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          {group.label}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !expanded && '-rotate-90')} aria-hidden />
        </button>
      )}
      {expanded && (
        <ul>
          {group.items.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-secondary text-secondary-foreground' : 'text-foreground/80 hover:bg-accent',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-5">
        <Logo />
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-3">
        {NAV_BY_ROLE[role].map((group, i) => (
          <GroupSection key={group.label ?? i} group={group} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  )
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent role={role} />
      </div>
    </aside>
  )
}
