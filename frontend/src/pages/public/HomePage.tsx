import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FEATURE_SECTIONS } from '@/constants/plans'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Manage Your Tuition Center Smarter</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            One platform for students, teachers, attendance, fees, academics and daily operations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className={cn(buttonVariants({ size: 'lg' }))}>
              Get Started
            </Link>
            <Link to="/pricing" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
              View Pricing
            </Link>
            <Link to="/login" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }))}>
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">Everything your center needs</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_SECTIONS.map((f) => (
            <Card key={f.title} className="p-6">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
