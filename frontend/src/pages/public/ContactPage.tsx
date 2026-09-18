import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Tell us a little more (at least 10 characters)'),
})
type Values = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  // No contact endpoint exists yet; wire this to the backend when one is available.
  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-2 text-muted-foreground">Tell us about your tuition center and we&apos;ll get back to you.</p>
      {sent ? (
        <p role="status" className="mt-8 rounded-md bg-emerald-50 p-4 text-emerald-800">
          Thanks, your message has been recorded.
        </p>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {(
            [
              ['name', 'Name', 'text'],
              ['email', 'Email', 'email'],
            ] as const
          ).map(([field, label, type]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Input id={field} type={type} aria-invalid={!!errors[field]} aria-describedby={`${field}-err`} {...register(field)} />
              <p id={`${field}-err`} role="alert" className="text-sm text-destructive">
                {errors[field]?.message}
              </p>
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              rows={4}
              aria-invalid={!!errors.message}
              aria-describedby="message-err"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm aria-[invalid=true]:border-destructive"
              {...register('message')}
            />
            <p id="message-err" role="alert" className="text-sm text-destructive">
              {errors.message?.message}
            </p>
          </div>
          <Button type="submit" loading={isSubmitting}>
            Send message
          </Button>
        </form>
      )}
    </div>
  )
}
