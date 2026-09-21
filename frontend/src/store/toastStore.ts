import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error'
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, tone: Toast['tone']) => void
  dismiss: (id: number) => void
}

let nextToastId = 1

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone) => {
    const id = nextToastId++
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => get().dismiss(id), 4500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
}
