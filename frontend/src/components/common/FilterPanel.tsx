import { Select } from '@/components/ui/select'

export interface FilterDef {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  allLabel?: string
}

export function FilterPanel({ filters }: { filters: FilterDef[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Select
          key={f.id}
          aria-label={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="h-10 w-auto min-w-36"
        >
          <option value="">{f.allLabel ?? `All ${f.label.toLowerCase()}`}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}
    </div>
  )
}
