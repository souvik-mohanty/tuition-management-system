import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormError } from '@/components/common/FormError'
import { FormField } from '@/components/forms/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { errorMessage, useBatches, useSaveSubject, useTeachers } from '@/features/directory/queries'
import type { Subject } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the subject name'),
  code: z.string().trim().min(2, 'Enter a subject code').max(16, 'Keep the code under 16 characters'),
  batchId: z.string().min(1, 'A subject must belong to a batch'),
  teacherId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export function SubjectFormModal({
  open,
  onClose,
  subject,
  presetBatchId,
}: {
  open: boolean
  onClose: () => void
  subject?: Subject
  presetBatchId?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={subject ? 'Edit subject' : 'Add subject'}>
      <SubjectForm subject={subject} presetBatchId={presetBatchId} onDone={onClose} />
    </Modal>
  )
}

function SubjectForm({ subject, presetBatchId, onDone }: { subject?: Subject; presetBatchId?: string; onDone: () => void }) {
  const batches = useBatches()
  const teachers = useTeachers()
  const save = useSaveSubject()
  const [serverError, setServerError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: subject?.name ?? '',
      code: subject?.code ?? '',
      batchId: subject?.batchId ?? presetBatchId ?? '',
      teacherId: subject?.teacherId ?? '',
      status: subject?.status ?? 'ACTIVE',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined)
    try {
      await save.mutateAsync({ id: subject?.id, input: { ...values, teacherId: values.teacherId || null } })
      onDone()
    } catch (e) {
      setServerError(errorMessage(e))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Subject name" htmlFor="sj-name" error={errors.name?.message}>
          <Input id="sj-name" aria-invalid={!!errors.name} aria-describedby="sj-name-error" {...register('name')} />
        </FormField>
        <FormField label="Code" htmlFor="sj-code" error={errors.code?.message}>
          <Input id="sj-code" placeholder="e.g. MATH-9A" aria-invalid={!!errors.code} aria-describedby="sj-code-error" {...register('code')} />
        </FormField>
      </div>
      <FormField label="Batch" htmlFor="sj-batch" error={errors.batchId?.message} hint="Subjects are batch-specific.">
        <Select
          id="sj-batch"
          disabled={!!subject}
          aria-invalid={!!errors.batchId}
          aria-describedby="sj-batch-error"
          {...register('batchId')}
        >
          <option value="">Select batch</option>
          {(batches.data ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Teacher" htmlFor="sj-teacher">
        <Select id="sj-teacher" {...register('teacherId')}>
          <option value="">Unassigned</option>
          {(teachers.data ?? [])
            .filter((t) => t.status === 'ACTIVE' || t.id === subject?.teacherId)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
        </Select>
      </FormField>
      <FormField label="Status" htmlFor="sj-status">
        <Select id="sj-status" {...register('status')}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </FormField>

      <FormError message={serverError} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {subject ? 'Save changes' : 'Add subject'}
        </Button>
      </div>
    </form>
  )
}
