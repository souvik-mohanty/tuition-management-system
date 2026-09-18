import { isAxiosError } from 'axios'
import type { ApiError } from '@/types'

export class ApiClientError extends Error implements ApiError {
  status: number
  fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to access this feature.",
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Some fields need your attention.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
}

export function normalizeError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) return error
  if (isAxiosError(error)) {
    if (!error.response) return new ApiClientError(0, 'Network error. Check your connection and try again.')
    const { status, data } = error.response
    const serverMessage = typeof data?.message === 'string' ? data.message : undefined
    const fieldErrors = data?.errors && typeof data.errors === 'object' ? (data.errors as Record<string, string>) : undefined
    // Never surface stack traces; only trust short server messages.
    const safe = serverMessage && serverMessage.length < 200 && !serverMessage.includes('\n') ? serverMessage : undefined
    return new ApiClientError(status, safe ?? MESSAGES[status] ?? 'Unexpected error occurred.', fieldErrors)
  }
  return new ApiClientError(-1, 'Unexpected error occurred.')
}

export const isFeatureRestricted = (e: unknown) => e instanceof ApiClientError && e.status === 403
