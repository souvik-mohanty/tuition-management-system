import { Badge } from '@/components/ui/badge'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  PAID: 'success',
  SUCCESS: 'success',
  COMPLETED: 'success',
  PRESENT: 'success',
  ONGOING: 'info',
  TRIAL: 'info',
  SCHEDULED: 'info',
  IN_PROGRESS: 'info',
  PENDING: 'warning',
  PARTIALLY_PAID: 'warning',
  PARTIALLY_REFUNDED: 'warning',
  LATE: 'warning',
  EXPIRED: 'danger',
  OVERDUE: 'danger',
  FAILED: 'danger',
  ABSENT: 'danger',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
  NOT_STARTED: 'neutral',
  INACTIVE: 'neutral',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? 'neutral'}>{status.replace(/_/g, ' ')}</Badge>
}
