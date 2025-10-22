import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Request, Response, HttpMethod, KeyValue, AuthConfig, BodyType, RequestSettings } from '../types'

interface RequestState {
  currentRequest: Request
  currentResponse: Response | null
  isLoading: boolean

  setMethod: (method: HttpMethod) => void
  setUrl: (url: string) => void
  setName: (name: string) => void
  addHeader: () => void
  updateHeader: (id: string, key: string, value: string, enabled: boolean) => void
  removeHeader: (id: string) => void
  addParam: () => void
  updateParam: (id: string, key: string, value: string, enabled: boolean) => void
  removeParam: (id: string) => void
  setBody: (type: BodyType, content: string) => void
  setAuth: (auth: AuthConfig) => void
  setPreRequestScript: (script: string) => void
  setTestScript: (script: string) => void
  updateSettings: (settings: Partial<RequestSettings>) => void
  setResponse: (response: Response | null) => void
  setLoading: (loading: boolean) => void
  resetRequest: () => void
  loadRequest: (request: Request) => void
}

const createDefaultRequest = (): Request => ({
  id: uuidv4(),
  name: 'New Request',
  method: 'GET',
  url: '',
  headers: [],
  params: [],
  body: {
    type: 'none',
    content: '',
  },
  auth: {
    type: 'none',
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const useRequestStore = create<RequestState>()(
  persist(
    (set) => ({
      currentRequest: createDefaultRequest(),
      currentResponse: null,
      isLoading: false,

      setMethod: (method) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            method,
            updatedAt: Date.now(),
          },
        })),

      setUrl: (url) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            url,
            updatedAt: Date.now(),
          },
        })),

      setName: (name) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            name,
            updatedAt: Date.now(),
          },
        })),

      addHeader: () =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: [
              ...state.currentRequest.headers,
              { id: uuidv4(), key: '', value: '', enabled: true },
            ],
            updatedAt: Date.now(),
          },
        })),

      updateHeader: (id, key, value, enabled) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: state.currentRequest.headers.map((h) =>
              h.id === id ? { ...h, key, value, enabled } : h
            ),
            updatedAt: Date.now(),
          },
        })),

      removeHeader: (id) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            headers: state.currentRequest.headers.filter((h) => h.id !== id),
            updatedAt: Date.now(),
          },
        })),

      addParam: () =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: [
              ...state.currentRequest.params,
              { id: uuidv4(), key: '', value: '', enabled: true },
            ],
            updatedAt: Date.now(),
          },
        })),

      updateParam: (id, key, value, enabled) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: state.currentRequest.params.map((p) =>
              p.id === id ? { ...p, key, value, enabled } : p
            ),
            updatedAt: Date.now(),
          },
        })),

      removeParam: (id) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            params: state.currentRequest.params.filter((p) => p.id !== id),
            updatedAt: Date.now(),
          },
        })),

      setBody: (type, content) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            body: { type, content },
            updatedAt: Date.now(),
          },
        })),

      setAuth: (auth) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            auth,
            updatedAt: Date.now(),
          },
        })),

      setPreRequestScript: (script) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            preRequestScript: script,
            updatedAt: Date.now(),
          },
        })),

      setTestScript: (script) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            testScript: script,
            updatedAt: Date.now(),
          },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          currentRequest: {
            ...state.currentRequest,
            settings: {
              ...state.currentRequest.settings,
              ...settings,
            },
            updatedAt: Date.now(),
          },
        })),

      setResponse: (response) =>
        set({ currentResponse: response }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      resetRequest: () =>
        set({
          currentRequest: createDefaultRequest(),
          currentResponse: null,
        }),

      loadRequest: (request) =>
        set({
          currentRequest: { ...request, updatedAt: Date.now() },
          currentResponse: null,
        }),
    }),
    {
      name: 'request-storage',
      partialize: (state) => ({
        currentRequest: state.currentRequest,
      }),
    }
  )
)
