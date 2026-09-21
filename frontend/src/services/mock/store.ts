import { addDays, format } from 'date-fns'
import type { Batch, ClassSession, FeeStatus, Parent, Student, Subject, Teacher } from '@/types'

// In-memory demo database. It is stateful for the browser session so create/edit/cancel behave like a real backend.
// All names, phone numbers and emails are fictional.

const now = new Date().toISOString()
const ymd = (d: Date) => format(d, 'yyyy-MM-dd')

export const YEAR = '2026-27'

const batches: Batch[] = [
  { id: 'b1', name: 'Grade 8 A', grade: '8', academicYear: YEAR, status: 'ACTIVE' },
  { id: 'b2', name: 'Grade 9 A', grade: '9', academicYear: YEAR, status: 'ACTIVE' },
  { id: 'b3', name: 'Grade 9 B', grade: '9', academicYear: YEAR, status: 'ACTIVE' },
  { id: 'b4', name: 'Grade 10 A', grade: '10', academicYear: YEAR, status: 'ACTIVE' },
  { id: 'b5', name: 'Grade 10 B', grade: '10', academicYear: YEAR, status: 'ACTIVE' },
  { id: 'b6', name: 'Grade 12 A (weekend)', grade: '12', academicYear: YEAR, status: 'INACTIVE' },
]

const teacherNames = ['Rahul Nair', 'Sunita Rao', 'Farah Khan', 'Vikram Sethi', 'Anita Bose', 'Karan Malhotra']
const teachers: Teacher[] = teacherNames.map((name, i) => ({
  id: `t${i + 1}`,
  name,
  phone: `+91 90000 1${String(i + 1).padStart(4, '0')}`,
  email: `${name.toLowerCase().replace(' ', '.')}@example.test`,
  status: i === 5 ? 'INACTIVE' : 'ACTIVE',
  createdAt: now,
  updatedAt: now,
}))

const subjectDefs: [name: string, code: string, teacherId: string][] = [
  ['Mathematics', 'MATH', 't1'],
  ['Physics', 'PHY', 't2'],
  ['English', 'ENG', 't3'],
  ['Chemistry', 'CHEM', 't4'],
]
const subjects: Subject[] = []
batches.slice(0, 5).forEach((b) => {
  const short = b.name.replace('Grade ', '').replace(' ', '')
  subjectDefs.forEach(([name, code, teacherId]) => {
    subjects.push({ id: `sub-${b.id}-${code.toLowerCase()}`, name, code: `${code}-${short}`, batchId: b.id, teacherId, status: 'ACTIVE' })
  })
})
subjects.push({ id: 'sub-b6-math', name: 'Mathematics', code: 'MATH-12A', batchId: 'b6', teacherId: 't1', status: 'INACTIVE' })
subjects.push({ id: 'sub-b6-hist', name: 'History', code: 'HIS-12A', batchId: 'b6', teacherId: null, status: 'INACTIVE' })

const parentNames = [
  'Kiran Das', 'Priya Menon', 'Amit Kapoor', 'Neha Joshi', 'Sanjay Roy', 'Deepa Bhat',
  'Manoj Iyer', 'Lata Sharma', 'Rohit Verma', 'Anjali Nair', 'Suresh Pillai', 'Geeta Rao',
]
const parents: Parent[] = parentNames.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  phone: `+91 90000 2${String(i + 1).padStart(4, '0')}`,
  email: `${name.toLowerCase().replace(' ', '.')}@example.test`,
  status: 'ACTIVE',
}))

const studentNames = [
  'Meera Iyer', 'Aarav Menon', 'Diya Kapoor', 'Ishaan Roy', 'Naina Joshi', 'Arjun Iyer',
  'Tara Bhat', 'Kabir Das', 'Anaya Sharma', 'Vihaan Verma', 'Riya Nair', 'Advait Pillai',
  'Saanvi Rao', 'Reyansh Das', 'Myra Menon', 'Aditya Kapoor', 'Ira Joshi', 'Krish Roy',
  'Pari Bhat', 'Shaurya Iyer', 'Kavya Sharma', 'Yash Verma', 'Zara Nair', 'Dev Pillai',
  'Navya Rao', 'Rudra Das', 'Aisha Khan', 'Om Kapoor', 'Sia Joshi', 'Neel Roy',
]
const feeCycle: FeeStatus[] = ['PAID', 'PAID', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE']
const students: Student[] = studentNames.map((name, i) => {
  const batch = batches[(i + 1) % 5]
  return {
    id: `s${i + 1}`,
    name,
    phone: `+91 90000 3${String(i + 1).padStart(4, '0')}`,
    email: `${name.toLowerCase().replace(' ', '.')}@example.test`,
    dob: `${2010 + (i % 4)}-0${(i % 9) + 1}-1${i % 9}`,
    address: `${10 + i}, Sample Street, Demo City`,
    parentId: parents[Math.floor(i / 3) % parents.length].id,
    batchId: batch.id,
    admissionDate: `2026-0${(i % 3) + 4}-0${(i % 8) + 1}`,
    status: i === 7 || i === 19 ? 'INACTIVE' : 'ACTIVE',
    attendancePct: 78 + ((i * 7) % 22),
    syllabusPct: 40 + ((i * 11) % 45),
    feeStatus: feeCycle[i % feeCycle.length],
    createdAt: now,
    updatedAt: now,
  }
})

// Timetable: subject s of batch i sits in slot (i + s) % 5, so no teacher or batch is ever double-booked.
const SLOTS: [string, string][] = [['09:00', '10:00'], ['10:15', '11:15'], ['11:30', '12:30'], ['14:00', '15:00'], ['16:00', '17:00']]
const classes: ClassSession[] = []
const today = new Date()
for (let offset = -14; offset <= 28; offset++) {
  const day = addDays(today, offset)
  if (day.getDay() === 0) continue
  batches.slice(0, 5).forEach((b, i) => {
    subjectDefs.forEach(([name, , teacherId], s) => {
      if ((offset + s + i) % 2 !== 0) return
      const [startTime, endTime] = SLOTS[(i + s) % SLOTS.length]
      const date = ymd(day)
      const seed = (offset + 14) * 31 + i * 7 + s
      let status: ClassSession['status'] = 'SCHEDULED'
      if (seed % 23 === 0) status = 'CANCELLED'
      else if (offset < 0) status = 'COMPLETED'
      else if (offset === 0 && endTime < format(today, 'HH:mm')) status = 'COMPLETED'
      classes.push({
        id: `c-${date}-${b.id}-${s}`,
        title: `${name} lesson`,
        batchId: b.id,
        subjectId: `sub-${b.id}-${subjectDefs[s][1].toLowerCase()}`,
        teacherId,
        date,
        startTime,
        endTime,
        room: `Room ${(i % 4) + 1}`,
        status,
      })
    })
  })
}

export const db = { batches, teachers, subjects, parents, students, classes }

let counter = 1000
export const nextId = (prefix: string) => `${prefix}${++counter}`

// Demo changes survive a page refresh for the rest of the day (the seed timetable is relative to today, so it is
// regenerated on a new day). Nothing here is sent anywhere; it only lives in this browser.
const STORAGE_KEY = 'classops-demo-db-v1'
const TODAY = ymd(new Date())

export function persistDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: TODAY, counter, data: db }))
  } catch {
    // storage unavailable or full: the demo keeps working in memory
  }
}

function hydrateDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as { day: string; counter: number; data: Record<keyof typeof db, unknown[]> }
    if (saved.day !== TODAY) return
    ;(Object.keys(db) as (keyof typeof db)[]).forEach((k) => {
      if (Array.isArray(saved.data[k])) (db[k] as unknown[]).splice(0, db[k].length, ...saved.data[k])
    })
    counter = Math.max(counter, saved.counter)
  } catch {
    // corrupt data: keep the seed
  }
}
hydrateDb()

/** Demo identities used by the teacher/student/parent pages (the real account ids are unrelated to the sample data). */
export const DEMO_TEACHER_ID = 't1'
export const DEMO_STUDENT_ID = 's1'
export const DEMO_PARENT_ID = 'p1'
