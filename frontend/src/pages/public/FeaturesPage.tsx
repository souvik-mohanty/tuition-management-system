import { Check } from 'lucide-react'
import { FEATURE_SECTIONS } from '@/constants/plans'

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold">Features</h1>
      <p className="mt-2 text-muted-foreground">Built for owners, teachers, students and parents.</p>
      <div className="mt-10 space-y-8">
        {FEATURE_SECTIONS.map((f) => (
          <section key={f.title} className="flex gap-4">
            <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-1 text-muted-foreground">{f.body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
