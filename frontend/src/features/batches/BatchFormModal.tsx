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
import { errorMessage, useSaveBatch } from '@/features/directory/queries'
import type { Batch } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the batch name'),
  grade: z.string().trim().min(1, 'Enter the class / grade'),
  academicYear: z.string().trim().regex(/^\d{4}-\d{2}$/, 'Use the format 2026-27'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export function BatchFormModal({ open, onClose, batch }: { open: boolean; onClose: () => void; batch?: Batch }) {
  return (
    <Modal open={open} onClose={onClose} title={batch ? 'Edit batch' : 'Create batch'}>
      <BatchForm batch={batch} onDone={onClose} />
    </Modal>
  )
}

function BatchForm({ batch, onDone }: { batch?: Batch; onDone: () => void }) {
  const save = useSaveBatch()
  const [serverError, setServerError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: batch?.name ?? '',
      grade: batch?.grade ?? '',
      academicYear: batch?.academicYear ?? '2026-27',
      status: batch?.status ?? 'ACTIVE',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined)
    try {
      await save.mutateAsync({ id: batch?.id, input: values })
      onDone()
    } catch (e) {
      setServerError(errorMessage(e))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormField label="Batch name" htmlFor="bf-name" error={errors.name?.message}>
        <Input id="bf-name" placeholder="e.g. Grade 9 C" aria-invalid={!!errors.name} aria-describedby="bf-name-error" {...register('name')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Class / grade" htmlFor="bf-grade" error={errors.grade?.message}>
          <Input id="bf-grade" aria-invalid={!!errors.grade} aria-describedby="bf-grade-error" {...register('grade')} />
        </FormField>
        <FormField label="Academic year" htmlFor="bf-year" error={errors.academicYear?.message}>
          <Input id="bf-year" aria-invalid={!!errors.academicYear} aria-describedby="bf-year-error" {...register('academicYear')} />
        </FormField>
      </div>
      <FormField label="Status" htmlFor="bf-status">
        <Select id="bf-status" {...register('status')}>
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
          {batch ? 'Save changes' : 'Create batch'}
        </Button>
      </div>
    </form>
  )
}
