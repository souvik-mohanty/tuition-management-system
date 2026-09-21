import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search',
  label,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pl-9"
      />
    </div>
  )
}
