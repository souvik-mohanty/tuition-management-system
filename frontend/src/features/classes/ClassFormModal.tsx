import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormError } from '@/components/common/FormError'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { errorMessage, useBatches, useSaveClass, useSubjects, useTeachers } from '@/features/directory/queries'
import type { ClassSession } from '@/types'

const today = () => format(new Date(), 'yyyy-MM-dd')

const schema = z
  .object({
    batchId: z.string().min(1, 'Select a batch'),
    subjectId: z.string().min(1, 'Select a subject'),
    teacherId: z.string().min(1, 'Select a teacher'),
    title: z.string().trim().min(2, 'Enter a topic or title'),
    date: z.string().min(1, 'Select a date'),
    startTime: z.string().min(1, 'Select a start time'),
    endTime: z.string().min(1, 'Select an end time'),
    room: z.string().trim().min(1, 'Enter a room'),
  })
  .superRefine((v, ctx) => {
    if (v.startTime && v.endTime && v.endTime <= v.startTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'End time must be after the start time' })
    }
  })
type Values = z.infer<typeof schema>

export function ClassFormModal({
  open,
  onClose,
  session,
  defaultDate,
}: {
  open: boolean
  onClose: () => void
  session?: ClassSession
  defaultDate?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={session ? 'Reschedule or edit class' : 'Schedule a class'} size="lg">
      <ClassForm session={session} defaultDate={defaultDate} onDone={onClose} />
    </Modal>
  )
}

function ClassForm({ session, defaultDate, onDone }: { session?: ClassSession; defaultDate?: string; onDone: () => void }) {
  const batches = useBatches()
  const subjects = useSubjects()
  const teachers = useTeachers()
  const save = useSaveClass()
  const [serverError, setServerError] = useState<string>()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      batchId: session?.batchId ?? '',
      subjectId: session?.subjectId ?? '',
      teacherId: session?.teacherId ?? '',
      title: session?.title ?? '',
      date: session?.date ?? defaultDate ?? today(),
      startTime: session?.startTime ?? '09:00',
      endTime: session?.endTime ?? '10:00',
      room: session?.room ?? 'Room 1',
    },
  })

  const batchId = watch('batchId')
  const batchSubjects = (subjects.data ?? []).filter((s) => s.batchId === batchId && s.status === 'ACTIVE')

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined)
    if (!session && values.date < today()) {
      setError('date', { message: 'Choose today or a future date' })
      return
    }
    try {
      await save.mutateAsync({ id: session?.id, input: values })
      onDone()
    } catch (e) {
      setServerError(errorMessage(e))
    }
  })

  const err = (k: keyof Values) => errors[k]?.message
  const invalid = (k: keyof Values) => !!errors[k]

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Batch" htmlFor="cf-batch" error={err('batchId')}>
          <Select
            id="cf-batch"
            aria-invalid={invalid('batchId')}
            aria-describedby="cf-batch-error"
            {...register('batchId', {
              onChange: () => {
                setValue('subjectId', '')
                setValue('teacherId', '')
              },
            })}
          >
            <option value="">Select batch</option>
            {(batches.data ?? [])
              .filter((b) => b.status === 'ACTIVE')
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </Select>
        </FormField>

        <FormField
          label="Subject"
          htmlFor="cf-subject"
          error={err('subjectId')}
          hint={batchId && batchSubjects.length === 0 ? 'This batch has no active subjects yet.' : undefined}
        >
          <Select
            id="cf-subject"
            aria-invalid={invalid('subjectId')}
            aria-describedby="cf-subject-error"
            disabled={!batchId}
            {...register('subjectId', {
              onChange: (e) => {
                const subject = batchSubjects.find((s) => s.id === e.target.value)
                setValue('teacherId', subject?.teacherId ?? '')
                if (subject) setValue('title', `${subject.name} lesson`)
              },
            })}
          >
            <option value="">Select subject</option>
            {batchSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Teacher" htmlFor="cf-teacher" error={err('teacherId')} hint="Defaults to the subject's teacher; change it for a substitute.">
          <Select id="cf-teacher" aria-invalid={invalid('teacherId')} aria-describedby="cf-teacher-error" {...register('teacherId')}>
            <option value="">Select teacher</option>
            {(teachers.data ?? [])
              .filter((t) => t.status === 'ACTIVE')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </Select>
        </FormField>

        <FormField label="Topic / title" htmlFor="cf-title" error={err('title')}>
          <Input id="cf-title" aria-invalid={invalid('title')} aria-describedby="cf-title-error" {...register('title')} />
        </FormField>

        <FormField label="Date" htmlFor="cf-date" error={err('date')}>
          <Input id="cf-date" type="date" aria-invalid={invalid('date')} aria-describedby="cf-date-error" {...register('date')} />
        </FormField>

        <FormField label="Room" htmlFor="cf-room" error={err('room')}>
          <Input id="cf-room" aria-invalid={invalid('room')} aria-describedby="cf-room-error" {...register('room')} />
        </FormField>

        <FormField label="Start time" htmlFor="cf-start" error={err('startTime')}>
          <Input id="cf-start" type="time" aria-invalid={invalid('startTime')} aria-describedby="cf-start-error" {...register('startTime')} />
        </FormField>

        <FormField label="End time" htmlFor="cf-end" error={err('endTime')}>
          <Input id="cf-end" type="time" aria-invalid={invalid('endTime')} aria-describedby="cf-end-error" {...register('endTime')} />
        </FormField>
      </div>

      <FormError message={serverError} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {session ? 'Save changes' : 'Schedule class'}
        </Button>
      </div>
    </form>
  )
}
