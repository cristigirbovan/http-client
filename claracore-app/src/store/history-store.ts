import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { HistoryEntry, Request, Response } from '../types'

interface HistoryState {
  history: HistoryEntry[]
  maxHistorySize: number

  addToHistory: (request: Request, response: Response) => void
  clearHistory: () => void
  deleteHistoryEntry: (id: string) => void
  getHistoryEntry: (id: string) => HistoryEntry | undefined
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      maxHistorySize: 100,

      addToHistory: (request, response) =>
        set((state) => {
          const newEntry: HistoryEntry = {
            id: uuidv4(),
            request,
            response,
            timestamp: Date.now(),
          }

          const newHistory = [newEntry, ...state.history]

          // Keep only maxHistorySize items
          if (newHistory.length > state.maxHistorySize) {
            newHistory.pop()
          }

          return { history: newHistory }
        }),

      clearHistory: () => set({ history: [] }),

      deleteHistoryEntry: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      getHistoryEntry: (id) => {
        return get().history.find((h) => h.id === id)
      },
    }),
    {
      name: 'history-storage',
    }
  )
)
