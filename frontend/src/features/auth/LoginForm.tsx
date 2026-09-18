import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { env } from '@/app/config/env'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_HOME } from '@/constants/navigation'
import { sendOtp, verifyOtp } from '@/services/api/auth'
import { normalizeError } from '@/services/api/errors'
import { useAuthStore } from '@/store/authStore'
import { useTenantStore } from '@/store/tenantStore'

const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})
const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
})

const RESEND_SECONDS = 30

function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {message}
    </p>
  )
}

export function LoginForm() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const setCurrentTuition = useTenantStore((s) => s.setCurrentTuition)
  const [phone, setPhone] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) })

  const sendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (_d, p) => {
      setPhone(p)
      setCountdown(RESEND_SECONDS)
      otpForm.reset()
    },
  })

  const verifyMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => verifyOtp(phone, otp),
    onSuccess: (session) => {
      setSession(session)
      if (session.memberships.length === 1) {
        setCurrentTuition(session.memberships[0].tuitionId)
        navigate(ROLE_HOME[session.memberships[0].role], { replace: true })
      } else {
        setCurrentTuition(null)
        navigate('/select-tuition', { replace: true })
      }
    },
  })

  const sendError = sendMutation.error ? normalizeError(sendMutation.error).message : undefined
  const verifyError = verifyMutation.error ? normalizeError(verifyMutation.error).message : undefined

  if (!phone) {
    return (
      <form
        noValidate
        onSubmit={phoneForm.handleSubmit((v) => sendMutation.mutate(v.phone))}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            placeholder="10-digit mobile number"
            aria-invalid={!!phoneForm.formState.errors.phone}
            aria-describedby="phone-error"
            {...phoneForm.register('phone')}
          />
          <div id="phone-error">
            <FormError message={phoneForm.formState.errors.phone?.message ?? sendError} />
          </div>
        </div>
        <Button type="submit" className="w-full" loading={sendMutation.isPending}>
          Send OTP
        </Button>
        {env.useMockApi && (
          <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Demo mode: use 9000000001 (owner), 9000000002 (teacher), 9000000003 (student) or 9000000004 (parent).
            OTP is 123456 (000000 simulates an expired OTP).
          </p>
        )}
      </form>
    )
  }

  return (
    <form
      noValidate
      onSubmit={otpForm.handleSubmit((v) => verifyMutation.mutate({ phone, otp: v.otp }))}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="otp">Enter the OTP sent to +91 {phone}</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit OTP"
          className="tracking-[0.4em]"
          aria-invalid={!!otpForm.formState.errors.otp}
          aria-describedby="otp-error"
          autoFocus
          {...otpForm.register('otp')}
        />
        <div id="otp-error">
          <FormError message={otpForm.formState.errors.otp?.message ?? verifyError ?? sendError} />
        </div>
      </div>
      <Button type="submit" className="w-full" loading={verifyMutation.isPending}>
        Verify and continue
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setPhone(null)
            verifyMutation.reset()
          }}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          Change number
        </button>
        <button
          type="button"
          disabled={countdown > 0 || sendMutation.isPending}
          onClick={() => sendMutation.mutate(phone)}
          className="cursor-pointer text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>
    </form>
  )
}
