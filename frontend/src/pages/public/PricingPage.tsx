import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PLANS } from '@/constants/plans'
import { cn } from '@/lib/utils'

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-center text-3xl font-bold">Pricing</h1>
      <p className="mt-2 text-center text-muted-foreground">Choose the plan that fits your tuition center.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.name} className={cn('flex flex-col p-6', p.highlighted && 'border-primary ring-1 ring-primary')}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <p className="mt-4">
              <span className="text-3xl font-bold">{p.price}</span>{' '}
              <span className="text-sm text-muted-foreground">{p.period}</span>
            </p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className={cn(buttonVariants({ variant: p.highlighted ? 'default' : 'outline' }), 'mt-6')}
            >
              Get Started
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
