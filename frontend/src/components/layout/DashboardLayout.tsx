import { Menu, X } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { TenantSelector } from '@/features/tenant/TenantSelector'
import { useSession } from '@/hooks/useSession'
import { useUiStore } from '@/store/uiStore'
import { Sidebar, SidebarContent } from './Sidebar'
import { UserMenu } from './UserMenu'

export function DashboardLayout() {
  const { role } = useSession()
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)
  const { pathname } = useLocation()

  useEffect(() => setMobileNavOpen(false), [pathname, setMobileNavOpen])

  if (!role) return null

  return (
    <div className="flex min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar role={role} />

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 cursor-pointer rounded-md p-1 hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent role={role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="cursor-pointer rounded-md p-2 hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <TenantSelector />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>
        <main id="main" className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
