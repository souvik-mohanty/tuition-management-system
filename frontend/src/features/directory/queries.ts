import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useSession'
import {
  cancelClass,
  createBatch,
  createClass,
  createStudent,
  createSubject,
  createTeacher,
  getStudent,
  getTeacher,
  listBatches,
  listClasses,
  listParents,
  listStudents,
  listSubjects,
  listTeachers,
  setStudentStatus,
  setTeacherStatus,
  updateBatch,
  updateClass,
  updateStudent,
  updateSubject,
  updateTeacher,
} from '@/services/api/directory'
import { normalizeError } from '@/services/api/errors'
import { toast } from '@/store/toastStore'
import type {
  ActiveStatus,
  BatchInput,
  ClassInput,
  StudentInput,
  SubjectInput,
  TeacherInput,
} from '@/types'

// Every key starts with the tuition id so tenants never share cache entries.
function useTenantId() {
  return useSession().tuitionId ?? 'none'
}

export const useStudents = () => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'students'], queryFn: listStudents })
}
export const useStudent = (id: string) => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'students', id], queryFn: () => getStudent(id) })
}
export const useParents = () => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'parents'], queryFn: listParents })
}
export const useTeachers = () => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'teachers'], queryFn: listTeachers })
}
export const useTeacher = (id: string) => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'teachers', id], queryFn: () => getTeacher(id) })
}
export const useBatches = () => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'batches'], queryFn: listBatches })
}
export const useSubjects = () => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'subjects'], queryFn: listSubjects })
}
export const useClasses = (from: string, to: string) => {
  const t = useTenantId()
  return useQuery({ queryKey: ['tenant', t, 'classes', from, to], queryFn: () => listClasses(from, to) })
}

/** Runs a write, refreshes the listed data scopes and shows success feedback; errors stay with the caller's form. */
function useWrite<V, R>(fn: (vars: V) => Promise<R>, scopes: string[], successMessage: string) {
  const qc = useQueryClient()
  const t = useTenantId()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      scopes.forEach((scope) => qc.invalidateQueries({ queryKey: ['tenant', t, scope] }))
      toast.success(successMessage)
    },
  })
}

export const useSaveStudent = () =>
  useWrite(
    ({ id, input }: { id?: string; input: StudentInput }) => (id ? updateStudent(id, input) : createStudent(input)),
    ['students', 'parents'],
    'Student saved.',
  )
export const useSetStudentStatus = () =>
  useWrite(({ id, status }: { id: string; status: ActiveStatus }) => setStudentStatus(id, status), ['students'], 'Student status updated.')

export const useSaveTeacher = () =>
  useWrite(
    ({ id, input }: { id?: string; input: TeacherInput }) => (id ? updateTeacher(id, input) : createTeacher(input)),
    ['teachers'],
    'Teacher saved.',
  )
export const useSetTeacherStatus = () =>
  useWrite(({ id, status }: { id: string; status: ActiveStatus }) => setTeacherStatus(id, status), ['teachers'], 'Teacher status updated.')

export const useSaveBatch = () =>
  useWrite(
    ({ id, input }: { id?: string; input: BatchInput }) => (id ? updateBatch(id, input) : createBatch(input)),
    ['batches'],
    'Batch saved.',
  )

export const useSaveSubject = () =>
  useWrite(
    ({ id, input }: { id?: string; input: SubjectInput }) => (id ? updateSubject(id, input) : createSubject(input)),
    ['subjects', 'teachers'],
    'Subject saved.',
  )

export const useSaveClass = () =>
  useWrite(
    ({ id, input }: { id?: string; input: ClassInput }) => (id ? updateClass(id, input) : createClass(input)),
    ['classes'],
    'Class saved.',
  )
export const useCancelClass = () => useWrite((id: string) => cancelClass(id), ['classes'], 'Class cancelled.')

export const errorMessage = (e: unknown) => normalizeError(e).message
