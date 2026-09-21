import { useMemo } from 'react'
import { useBatches, useSubjects, useTeachers } from './queries'

/** Id -> display-name helpers shared by every screen that shows batches, subjects or teachers. */
export function useLookups() {
  const batches = useBatches()
  const subjects = useSubjects()
  const teachers = useTeachers()

  return useMemo(() => {
    const batchById = new Map((batches.data ?? []).map((b) => [b.id, b]))
    const subjectById = new Map((subjects.data ?? []).map((s) => [s.id, s]))
    const teacherById = new Map((teachers.data ?? []).map((t) => [t.id, t]))
    return {
      isLoading: batches.isLoading || subjects.isLoading || teachers.isLoading,
      batchName: (id: string | null | undefined) => (id ? batchById.get(id)?.name ?? 'Unknown batch' : 'Unassigned'),
      subjectName: (id: string) => subjectById.get(id)?.name ?? 'Unknown subject',
      teacherName: (id: string | null | undefined) => (id ? teacherById.get(id)?.name ?? 'Unknown teacher' : 'Unassigned'),
    }
  }, [batches.data, subjects.data, teachers.data, batches.isLoading, subjects.isLoading, teachers.isLoading])
}
