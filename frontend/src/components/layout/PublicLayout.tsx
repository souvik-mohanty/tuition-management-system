import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function PublicLayout() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium hover:text-primary', isActive ? 'text-primary' : 'text-foreground/70')

  return (
    <div className="flex min-h-screen flex-col bg-card">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-md bg-primary p-1.5 text-primary-foreground">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-semibold">TuitionSaaS</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" className={cn(buttonVariants({ size: 'sm' }))}>
              Login
            </Link>
          </nav>
          <button
            type="button"
            className="cursor-pointer rounded-md p-2 hover:bg-accent md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" className={cn(buttonVariants({ size: 'sm' }), 'w-fit')} onClick={() => setOpen(false)}>
              Login
            </Link>
          </nav>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TuitionSaaS</p>
          <div className="flex gap-4">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
