// Marketing copy for the public pricing page. Sample values: replace with the real plans
// (the authoritative plans/features come from the backend subscription API in Phase 5/7).
export interface MarketingPlan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
}

export const PLANS: MarketingPlan[] = [
  {
    name: 'Starter',
    price: '₹999',
    period: 'per month',
    description: 'For small tuition centers getting organised.',
    features: ['Up to 50 students', 'Students, teachers and batches', 'Class scheduling', 'Attendance tracking'],
  },
  {
    name: 'Growth',
    price: '₹2,499',
    period: 'per month',
    description: 'For growing centers that need fees and academics.',
    features: ['Up to 250 students', 'Everything in Starter', 'Fee management and invoices', 'Syllabus, assignments and tests', 'Analytics'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '₹4,999',
    period: 'per month',
    description: 'For multi-batch centers running at scale.',
    features: ['Unlimited students', 'Everything in Growth', 'Teacher payments and wallet', 'Priority support'],
  },
]

export const FEATURE_SECTIONS = [
  { title: 'Student Management', body: 'Keep student, parent and batch records in one place, with a full academic and fee history.' },
  { title: 'Teacher Management', body: 'Assign teachers to batches and subjects, view schedules and track payments.' },
  { title: 'Attendance', body: 'Mark attendance per class in seconds and see trends by student, batch and subject.' },
  { title: 'Academic Management', body: 'Plan syllabus roadmaps, set assignments, schedule tests and record results.' },
  { title: 'Fee Management', body: 'Create fee plans, record payments, track overdue fees and download invoices.' },
  { title: 'Analytics', body: 'Understand student growth, revenue, attendance and syllabus completion at a glance.' },
  { title: 'Subscription Management', body: 'Choose the plan that fits your center and change it as you grow.' },
]
