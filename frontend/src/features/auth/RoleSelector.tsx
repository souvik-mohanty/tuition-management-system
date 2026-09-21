import { GraduationCap, ShieldCheck, UsersRound, Presentation, type LucideIcon } from 'lucide-react'
import { ROLE_LABEL } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const OPTIONS: { role: Role; icon: LucideIcon }[] = [
  { role: 'OWNER', icon: ShieldCheck },
  { role: 'TEACHER', icon: Presentation },
  { role: 'STUDENT', icon: GraduationCap },
  { role: 'PARENT', icon: UsersRound },
]

const STORAGE_KEY = 'classops-login-role'

export function readSavedRole(): Role {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (OPTIONS.some((o) => o.role === saved)) return saved as Role
  } catch {
    // storage unavailable
  }
  return 'OWNER'
}

export function saveRole(role: Role) {
  try {
    localStorage.setItem(STORAGE_KEY, role)
  } catch {
    // storage unavailable
  }
}

export function RoleSelector({
  value,
  onChange,
  disabled,
}: {
  value: Role
  onChange: (role: Role) => void
  disabled?: boolean
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-2 text-sm font-medium">Log in as</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ role, icon: Icon }) => (
          <label key={role} className="relative cursor-pointer">
            <input
              type="radio"
              name="login-role"
              value={role}
              checked={value === role}
              onChange={() => onChange(role)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm font-medium',
                'peer-checked:border-primary peer-checked:bg-secondary peer-checked:text-secondary-foreground',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {ROLE_LABEL[role]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
