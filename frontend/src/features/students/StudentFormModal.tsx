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
import { Textarea } from '@/components/ui/textarea'
import { errorMessage, useBatches, useParents, useSaveStudent, useSubjects } from '@/features/directory/queries'
import type { Student } from '@/types'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the full name'),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,16}$/, 'Enter a valid phone number'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]),
  dob: z.string().min(1, 'Select the date of birth'),
  address: z.string().trim().min(3, 'Enter the address'),
  parentId: z.string(),
  batchId: z.string().min(1, 'Select a batch'),
  admissionDate: z.string().min(1, 'Select the admission date'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
type Values = z.infer<typeof schema>

export function StudentFormModal({ open, onClose, student }: { open: boolean; onClose: () => void; student?: Student }) {
  return (
    <Modal open={open} onClose={onClose} title={student ? 'Edit student' : 'Add student'} size="lg">
      <StudentForm student={student} onDone={onClose} />
    </Modal>
  )
}

function StudentForm({ student, onDone }: { student?: Student; onDone: () => void }) {
  const batches = useBatches()
  const parents = useParents()
  const subjects = useSubjects()
  const save = useSaveStudent()
  const [serverError, setServerError] = useState<string>()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: student?.name ?? '',
      phone: student?.phone ?? '',
      email: student?.email ?? '',
      dob: student?.dob ?? '',
      address: student?.address ?? '',
      parentId: student?.parentId ?? '',
      batchId: student?.batchId ?? '',
      admissionDate: student?.admissionDate ?? format(new Date(), 'yyyy-MM-dd'),
      status: student?.status ?? 'ACTIVE',
    },
  })

  const batchId = watch('batchId')
  const batchSubjects = (subjects.data ?? []).filter((s) => s.batchId === batchId && s.status === 'ACTIVE')

  const onSubmit = handleSubmit(async (values) => {
    setServerError(undefined)
    try {
      await save.mutateAsync({ id: student?.id, input: { ...values, parentId: values.parentId || null } })
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
        <FormField label="Full name" htmlFor="sf-name" error={err('name')}>
          <Input id="sf-name" autoComplete="off" aria-invalid={invalid('name')} aria-describedby="sf-name-error" {...register('name')} />
        </FormField>
        <FormField label="Phone" htmlFor="sf-phone" error={err('phone')}>
          <Input id="sf-phone" type="tel" aria-invalid={invalid('phone')} aria-describedby="sf-phone-error" {...register('phone')} />
        </FormField>
        <FormField label="Email (optional)" htmlFor="sf-email" error={err('email')}>
          <Input id="sf-email" type="email" aria-invalid={invalid('email')} aria-describedby="sf-email-error" {...register('email')} />
        </FormField>
        <FormField label="Date of birth" htmlFor="sf-dob" error={err('dob')}>
          <Input id="sf-dob" type="date" aria-invalid={invalid('dob')} aria-describedby="sf-dob-error" {...register('dob')} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Address" htmlFor="sf-address" error={err('address')}>
            <Textarea id="sf-address" aria-invalid={invalid('address')} aria-describedby="sf-address-error" {...register('address')} />
          </FormField>
        </div>
        <FormField label="Parent / guardian" htmlFor="sf-parent" error={err('parentId')}>
          <Select id="sf-parent" {...register('parentId')}>
            <option value="">No parent linked</option>
            {(parents.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Batch" htmlFor="sf-batch" error={err('batchId')}>
          <Select id="sf-batch" aria-invalid={invalid('batchId')} aria-describedby="sf-batch-error" {...register('batchId')}>
            <option value="">Select batch</option>
            {(batches.data ?? [])
              .filter((b) => b.status === 'ACTIVE' || b.id === student?.batchId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </Select>
        </FormField>
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-medium">Subjects (from the selected batch)</p>
          {!batchId ? (
            <p className="text-sm text-muted-foreground">Select a batch to see its subjects.</p>
          ) : batchSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">This batch has no active subjects yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {batchSubjects.map((s) => (
                <li key={s.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <FormField label="Admission date" htmlFor="sf-admission" error={err('admissionDate')}>
          <Input id="sf-admission" type="date" aria-invalid={invalid('admissionDate')} aria-describedby="sf-admission-error" {...register('admissionDate')} />
        </FormField>
        <FormField label="Status" htmlFor="sf-status">
          <Select id="sf-status" {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </FormField>
      </div>

      <FormError message={serverError} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {student ? 'Save changes' : 'Add student'}
        </Button>
      </div>
    </form>
  )
}
