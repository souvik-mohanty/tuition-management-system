import { env } from '@/app/config/env'
import type {
  ActiveStatus,
  Batch,
  BatchInput,
  ClassInput,
  ClassSession,
  Parent,
  Student,
  StudentInput,
  Subject,
  SubjectInput,
  Teacher,
  TeacherInput,
} from '@/types'
import { delay } from '../mock/db'
import { db, nextId, persistDb } from '../mock/store'
import { apiClient, endpoints } from './client'
import { ApiClientError } from './errors'

// Every function below talks to the in-memory demo store when VITE_USE_MOCK_API=true and to the REST API otherwise
// (same paths the backend will expose), so pages never need to change when the real endpoints arrive.

const MOCK_MS = 350
const clone = <T>(v: T): T => structuredClone(v)

/** Saves a mock write to the browser and returns the saved record. */
function commit<T>(value: T): Promise<T> {
  persistDb()
  return delay(clone(value), MOCK_MS)
}
const stamp = () => new Date().toISOString()

async function get<T>(url: string, params?: Record<string, string>): Promise<T> {
  const { data } = await apiClient.get<T>(url, { params })
  return data
}
async function send<T>(method: 'post' | 'put' | 'patch', url: string, body?: unknown): Promise<T> {
  const { data } = await apiClient[method]<T>(url, body)
  return data
}

function need<T>(item: T | undefined, what: string): T {
  if (!item) throw new ApiClientError(404, `${what} not found.`)
  return item
}

// ---------- students ----------
export async function listStudents(): Promise<Student[]> {
  if (!env.useMockApi) return get(endpoints.students)
  return delay(clone(db.students), MOCK_MS)
}

export async function getStudent(id: string): Promise<Student> {
  if (!env.useMockApi) return get(`${endpoints.students}/${id}`)
  return delay(clone(need(db.students.find((s) => s.id === id), 'Student')), MOCK_MS)
}

export async function createStudent(input: StudentInput): Promise<Student> {
  if (!env.useMockApi) return send('post', endpoints.students, input)
  const student: Student = {
    ...input,
    id: nextId('s'),
    attendancePct: 100,
    syllabusPct: 0,
    feeStatus: 'PENDING',
    createdAt: stamp(),
    updatedAt: stamp(),
  }
  db.students.unshift(student)
  return commit(student)
}

export async function updateStudent(id: string, input: StudentInput): Promise<Student> {
  if (!env.useMockApi) return send('put', `${endpoints.students}/${id}`, input)
  const student = need(db.students.find((s) => s.id === id), 'Student')
  Object.assign(student, input, { updatedAt: stamp() })
  return commit(student)
}

export async function setStudentStatus(id: string, status: ActiveStatus): Promise<Student> {
  if (!env.useMockApi) return send('patch', `${endpoints.students}/${id}/status`, { status })
  const student = need(db.students.find((s) => s.id === id), 'Student')
  Object.assign(student, { status, updatedAt: stamp() })
  return commit(student)
}

// ---------- parents ----------
export async function listParents(): Promise<Parent[]> {
  if (!env.useMockApi) return get(endpoints.parents)
  return delay(clone(db.parents), MOCK_MS)
}

// ---------- teachers ----------
export async function listTeachers(): Promise<Teacher[]> {
  if (!env.useMockApi) return get(endpoints.teachers)
  return delay(clone(db.teachers), MOCK_MS)
}

export async function getTeacher(id: string): Promise<Teacher> {
  if (!env.useMockApi) return get(`${endpoints.teachers}/${id}`)
  return delay(clone(need(db.teachers.find((t) => t.id === id), 'Teacher')), MOCK_MS)
}

export async function createTeacher(input: TeacherInput): Promise<Teacher> {
  if (!env.useMockApi) return send('post', endpoints.teachers, input)
  const teacher: Teacher = { ...input, id: nextId('t'), createdAt: stamp(), updatedAt: stamp() }
  db.teachers.unshift(teacher)
  return commit(teacher)
}

export async function updateTeacher(id: string, input: TeacherInput): Promise<Teacher> {
  if (!env.useMockApi) return send('put', `${endpoints.teachers}/${id}`, input)
  const teacher = need(db.teachers.find((t) => t.id === id), 'Teacher')
  Object.assign(teacher, input, { updatedAt: stamp() })
  return commit(teacher)
}

export async function setTeacherStatus(id: string, status: ActiveStatus): Promise<Teacher> {
  if (!env.useMockApi) return send('patch', `${endpoints.teachers}/${id}/status`, { status })
  const teacher = need(db.teachers.find((t) => t.id === id), 'Teacher')
  Object.assign(teacher, { status, updatedAt: stamp() })
  return commit(teacher)
}

// ---------- batches ----------
export async function listBatches(): Promise<Batch[]> {
  if (!env.useMockApi) return get(endpoints.batches)
  return delay(clone(db.batches), MOCK_MS)
}

export async function createBatch(input: BatchInput): Promise<Batch> {
  if (!env.useMockApi) return send('post', endpoints.batches, input)
  const batch: Batch = { ...input, id: nextId('b') }
  db.batches.push(batch)
  return commit(batch)
}

export async function updateBatch(id: string, input: BatchInput): Promise<Batch> {
  if (!env.useMockApi) return send('put', `${endpoints.batches}/${id}`, input)
  const batch = need(db.batches.find((b) => b.id === id), 'Batch')
  Object.assign(batch, input)
  return commit(batch)
}

// ---------- subjects ----------
export async function listSubjects(): Promise<Subject[]> {
  if (!env.useMockApi) return get(endpoints.subjects)
  return delay(clone(db.subjects), MOCK_MS)
}

export async function createSubject(input: SubjectInput): Promise<Subject> {
  if (!env.useMockApi) return send('post', endpoints.subjects, input)
  need(db.batches.find((b) => b.id === input.batchId), 'Batch')
  const subject: Subject = { ...input, id: nextId('sub') }
  db.subjects.push(subject)
  return commit(subject)
}

export async function updateSubject(id: string, input: SubjectInput): Promise<Subject> {
  if (!env.useMockApi) return send('put', `${endpoints.subjects}/${id}`, input)
  const subject = need(db.subjects.find((s) => s.id === id), 'Subject')
  Object.assign(subject, input)
  return commit(subject)
}

// ---------- classes / scheduling ----------
export async function listClasses(from: string, to: string): Promise<ClassSession[]> {
  if (!env.useMockApi) return get(endpoints.classes, { from, to })
  return delay(clone(db.classes.filter((c) => c.date >= from && c.date <= to)), MOCK_MS)
}

const overlaps = (a: ClassSession | ClassInput, b: ClassSession | ClassInput) =>
  a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime

/** PRD rules: a teacher cannot teach two classes at once, and a batch cannot have two classes at once. */
function assertNoConflict(input: ClassInput, ignoreId?: string) {
  const active = db.classes.filter((c) => c.status !== 'CANCELLED' && c.id !== ignoreId)
  const teacherClash = active.find((c) => c.teacherId === input.teacherId && overlaps(c, input))
  if (teacherClash) {
    const teacher = db.teachers.find((t) => t.id === input.teacherId)
    throw new ApiClientError(
      409,
      `${teacher?.name ?? 'This teacher'} already has a class at ${teacherClash.startTime}-${teacherClash.endTime} on ${input.date}.`,
    )
  }
  const batchClash = active.find((c) => c.batchId === input.batchId && overlaps(c, input))
  if (batchClash) {
    const batch = db.batches.find((b) => b.id === input.batchId)
    throw new ApiClientError(
      409,
      `${batch?.name ?? 'This batch'} already has a class at ${batchClash.startTime}-${batchClash.endTime} on ${input.date}.`,
    )
  }
}

export async function createClass(input: ClassInput): Promise<ClassSession> {
  if (!env.useMockApi) return send('post', endpoints.classes, input)
  assertNoConflict(input)
  const session: ClassSession = { ...input, id: nextId('c'), status: 'SCHEDULED' }
  db.classes.push(session)
  return commit(session)
}

export async function updateClass(id: string, input: ClassInput): Promise<ClassSession> {
  if (!env.useMockApi) return send('put', `${endpoints.classes}/${id}`, input)
  const session = need(db.classes.find((c) => c.id === id), 'Class')
  if (session.status === 'COMPLETED') throw new ApiClientError(409, 'A completed class cannot be changed.')
  assertNoConflict(input, id)
  Object.assign(session, input)
  return commit(session)
}

export async function cancelClass(id: string): Promise<ClassSession> {
  if (!env.useMockApi) return send('post', `${endpoints.classes}/${id}/cancel`)
  const session = need(db.classes.find((c) => c.id === id), 'Class')
  if (session.status === 'COMPLETED') throw new ApiClientError(409, 'A completed class cannot be cancelled.')
  session.status = 'CANCELLED'
  return commit(session)
}
