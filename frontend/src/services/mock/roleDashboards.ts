import type { ParentDashboardData, StudentDashboardData, TeacherDashboardData } from '@/types'

// Clearly fictional demo data.
export const mockTeacherDashboard: TeacherDashboardData = {
  summary: { assignedBatches: 3, students: 74, todaysClasses: 3, attendancePending: 1, submissionsToReview: 12 },
  schedule: [
    { id: 't1', title: 'Algebra Basics', batch: 'Grade 9 A', subject: 'Mathematics', teacher: 'You', time: '09:00 - 10:00', room: 'Room 1', status: 'COMPLETED' },
    { id: 't2', title: 'Trigonometry', batch: 'Grade 10 A', subject: 'Mathematics', teacher: 'You', time: '11:00 - 12:00', room: 'Room 2', status: 'ONGOING' },
    { id: 't3', title: 'Coordinate Geometry', batch: 'Grade 10 B', subject: 'Mathematics', teacher: 'You', time: '16:00 - 17:00', room: 'Room 2', status: 'SCHEDULED' },
  ],
  batches: [
    { id: 'b1', name: 'Grade 9 A', students: 28, syllabusPct: 64 },
    { id: 'b2', name: 'Grade 10 A', students: 26, syllabusPct: 48 },
    { id: 'b3', name: 'Grade 10 B', students: 20, syllabusPct: 71 },
  ],
  attention: [
    { id: 'a1', text: 'Attendance not marked yet: Grade 10 A, Trigonometry' },
    { id: 'a2', text: '12 assignment submissions waiting for review' },
    { id: 'a3', text: 'Unit test for Grade 9 A is scheduled for Friday' },
  ],
}

export const mockStudentDashboard: StudentDashboardData = {
  batch: 'Grade 9 A',
  summary: { attendancePct: 92, syllabusPct: 61, pendingAssignments: 2, pendingFees: 3000 },
  upcoming: [
    { id: 's1', title: 'Algebra Basics', batch: 'Grade 9 A', subject: 'Mathematics', teacher: 'Rahul Nair', time: 'Today 16:00', room: 'Room 1', status: 'SCHEDULED' },
    { id: 's2', title: 'Motion and Force', batch: 'Grade 9 A', subject: 'Physics', teacher: 'Sunita Rao', time: 'Tomorrow 10:30', room: 'Room 2', status: 'SCHEDULED' },
    { id: 's3', title: 'Essay Writing', batch: 'Grade 9 A', subject: 'English', teacher: 'Farah Khan', time: 'Tomorrow 12:00', room: 'Room 3', status: 'SCHEDULED' },
  ],
  subjects: [
    { name: 'Mathematics', progress: 68 },
    { name: 'Physics', progress: 55 },
    { name: 'English', progress: 72 },
    { name: 'Chemistry', progress: 49 },
  ],
  assignments: [
    { id: 'as1', title: 'Linear equations worksheet', subject: 'Mathematics', due: '2026-09-24', status: 'PENDING' },
    { id: 'as2', title: 'Laws of motion short answers', subject: 'Physics', due: '2026-09-25', status: 'PENDING' },
    { id: 'as3', title: 'Reading summary', subject: 'English', due: '2026-09-18', status: 'COMPLETED' },
  ],
  results: [
    { id: 'r1', test: 'Unit Test 1', subject: 'Mathematics', marks: 42, max: 50, date: '2026-09-10' },
    { id: 'r2', test: 'Unit Test 1', subject: 'Physics', marks: 33, max: 50, date: '2026-09-11' },
    { id: 'r3', test: 'Class Test', subject: 'English', marks: 18, max: 25, date: '2026-09-05' },
  ],
}

export const mockParentDashboard: ParentDashboardData = {
  children: [
    {
      id: 'c1',
      name: 'Meera Iyer',
      batch: 'Grade 9 A',
      attendancePct: 92,
      syllabusPct: 61,
      feesPending: 3000,
      nextClass: 'Mathematics, today 16:00',
      assignments: mockStudentDashboard.assignments,
      results: mockStudentDashboard.results,
    },
    {
      id: 'c2',
      name: 'Arjun Iyer',
      batch: 'Grade 6 B',
      attendancePct: 87,
      syllabusPct: 54,
      feesPending: 0,
      nextClass: 'Science, tomorrow 09:30',
      assignments: [
        { id: 'ca1', title: 'Fractions practice', subject: 'Mathematics', due: '2026-09-23', status: 'PENDING' },
        { id: 'ca2', title: 'Plant parts diagram', subject: 'Science', due: '2026-09-16', status: 'OVERDUE' },
      ],
      results: [
        { id: 'cr1', test: 'Unit Test 1', subject: 'Mathematics', marks: 21, max: 25, date: '2026-09-09' },
        { id: 'cr2', test: 'Unit Test 1', subject: 'Science', marks: 19, max: 25, date: '2026-09-10' },
      ],
    },
  ],
}
