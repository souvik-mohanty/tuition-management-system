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
import { errorMessage, useSaveTeacher } from '@/features/directory/queries'
import type { Teacher } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the full name'),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,16}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email address'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export function TeacherFormModal({ open, onClose, teacher }: { open: boolean; onClose: () => void; teacher?: Teacher }) {
  return (
    <Modal open={open} onClose={onClose} title={teacher ? 'Edit teacher' : 'Add teacher'}>
      <TeacherForm teacher={teacher} onDone={onClose} />
    </Modal>
  )
}

function TeacherForm({ teacher, onDone }: { teacher?: Teacher; onDone: () => void }) {
  const save = useSaveTeacher()
  const [serverError, setServerError] = useState<string>()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: teacher?.name ?? '',
      phone: teacher?.phone ?? '',
      email: teacher?.email ?? '',
      status: teacher?.status ?? 'ACTIVE',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined)
    try {
      await save.mutateAsync({ id: teacher?.id, input: values })
      onDone()
    } catch (e) {
      setServerError(errorMessage(e))
    }
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4">
      <FormField label="Full name" htmlFor="tf-name" error={errors.name?.message}>
        <Input id="tf-name" aria-invalid={!!errors.name} aria-describedby="tf-name-error" {...register('name')} />
      </FormField>
      <FormField label="Mobile number" htmlFor="tf-phone" error={errors.phone?.message}>
        <Input id="tf-phone" type="tel" aria-invalid={!!errors.phone} aria-describedby="tf-phone-error" {...register('phone')} />
      </FormField>
      <FormField label="Email" htmlFor="tf-email" error={errors.email?.message}>
        <Input id="tf-email" type="email" aria-invalid={!!errors.email} aria-describedby="tf-email-error" {...register('email')} />
      </FormField>
      <FormField label="Status" htmlFor="tf-status">
        <Select id="tf-status" {...register('status')}>
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
          {teacher ? 'Save changes' : 'Add teacher'}
        </Button>
      </div>
    </form>
  )
}
