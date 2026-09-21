import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { SearchBar } from '@/components/common/SearchBar'
import { EmptyState, ErrorState } from '@/components/common/states'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounced } from '@/hooks/useDebounced'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  /** Makes the column sortable. */
  sortValue?: (row: T) => string | number
  className?: string
  /** Hide the column below this breakpoint (the table also scrolls horizontally on small screens). */
  hideBelow?: 'md' | 'lg'
}

interface DataTableProps<T> {
  caption: string
  columns: Column<T>[]
  rows: T[] | undefined
  getRowId: (row: T) => string
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  searchText?: (row: T) => string
  searchPlaceholder?: string
  filters?: ReactNode
  toolbarActions?: ReactNode
  pageSize?: number
  emptyTitle: string
  emptyDescription?: string
  emptyAction?: ReactNode
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  isLoading,
  error,
  onRetry,
  searchText,
  searchPlaceholder,
  filters,
  toolbarActions,
  pageSize = 8,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const query = useDebounced(search.trim().toLowerCase())
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  const visible = useMemo(() => {
    let out = rows ?? []
    if (query && searchText) out = out.filter((r) => searchText(r).toLowerCase().includes(query))
    const col = sort && columns.find((c) => c.key === sort.key)
    if (sort && col?.sortValue) {
      const dir = sort.dir === 'asc' ? 1 : -1
      const value = col.sortValue
      out = [...out].sort((a, b) => {
        const x = value(a)
        const y = value(b)
        return (x < y ? -1 : x > y ? 1 : 0) * dir
      })
    }
    return out
  }, [rows, query, searchText, sort, columns])

  const pages = Math.max(1, Math.ceil(visible.length / pageSize))
  useEffect(() => setPage(1), [query, rows?.length, sort])
  const current = Math.min(page, pages)
  const start = (current - 1) * pageSize
  const pageRows = visible.slice(start, start + pageSize)

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  const hideClass = (c: Column<T>) => (c.hideBelow === 'md' ? 'hidden md:table-cell' : c.hideBelow === 'lg' ? 'hidden lg:table-cell' : '')

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        {searchText && (
          <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder} label={`Search ${caption.toLowerCase()}`} />
        )}
        {filters}
        {toolbarActions && <div className="ml-auto flex gap-2">{toolbarActions}</div>}
      </div>

      {error ? (
        <ErrorState error={error} title={`Unable to load ${caption.toLowerCase()}`} onRetry={onRetry} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((c) => {
                  const sorted = sort?.key === c.key ? sort.dir : null
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      className={cn('px-4 py-3 font-medium', hideClass(c), c.className)}
                    >
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-foreground"
                        >
                          {c.header}
                          {sorted === 'asc' ? (
                            <ArrowUp className="h-3 w-3" aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="h-3 w-3" aria-hidden />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-4 py-3', hideClass(c))}>
                        <Skeleton className="h-5 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.map((row) => (
                <tr key={getRowId(row)} className="hover:bg-muted/30">
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 align-middle', hideClass(c), c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && visible.length === 0 && (
            <EmptyState
              title={query ? 'No matches found.' : emptyTitle}
              description={query ? 'Try a different search or clear the filters.' : emptyDescription}
              action={query ? undefined : emptyAction}
            />
          )}
        </div>
      )}

      {!error && !isLoading && visible.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-sm text-muted-foreground">
          <p>
            Showing {start + 1}-{Math.min(start + pageSize, visible.length)} of {visible.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <span aria-live="polite">
              Page {current} of {pages}
            </span>
            <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
