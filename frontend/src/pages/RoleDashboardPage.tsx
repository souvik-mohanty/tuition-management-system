import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { NAV_BY_ROLE } from '@/constants/navigation'
import { useSession } from '@/hooks/useSession'
import { greeting } from '@/utils/format'

/** Interim dashboard for teacher/student/parent: greeting, tuition context and quick links. Data widgets land in Phase 3. */
export default function RoleDashboardPage() {
  const { user, role, tuitionName } = useSession()
  if (!role) return null
  const links = NAV_BY_ROLE[role].flatMap((g) => g.items).filter((i) => !i.to.endsWith('/dashboard'))

  return (
    <>
      <PageHeader title={`${greeting()}, ${user?.name.split(' ')[0] ?? ''}`} description={tuitionName ?? undefined} />
      <section aria-label="Quick links" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ label, to, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex items-center gap-3 p-4 hover:bg-accent">
              <span className="rounded-md bg-secondary p-2 text-secondary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-medium">{label}</span>
            </Card>
          </Link>
        ))}
      </section>
    </>
  )
}
