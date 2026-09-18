import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ApiClientError } from '@/services/api/errors'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        // Don't retry client errors (401/403/404/422...); retry transient failures once.
        if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) return false
        return count < 1
      },
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
