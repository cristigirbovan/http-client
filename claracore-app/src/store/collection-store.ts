import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Collection, Request } from '../types'

interface CollectionState {
  collections: Collection[]

  addCollection: (name: string, description?: string) => void
  updateCollection: (id: string, name: string, description?: string) => void
  deleteCollection: (id: string) => void
  addRequest: (collectionId: string, request: Request) => void
  updateRequest: (collectionId: string, requestId: string, request: Request) => void
  deleteRequest: (collectionId: string, requestId: string) => void
  getCollection: (id: string) => Collection | undefined
  getRequest: (collectionId: string, requestId: string) => Request | undefined
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: [],

      addCollection: (name, description) =>
        set((state) => ({
          collections: [
            ...state.collections,
            {
              id: uuidv4(),
              name,
              description,
              requests: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateCollection: (id, name, description) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id
              ? { ...c, name, description, updatedAt: Date.now() }
              : c
          ),
        })),

      deleteCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      addRequest: (collectionId, request) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  requests: [...c.requests, request],
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      updateRequest: (collectionId, requestId, request) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  requests: c.requests.map((r) =>
                    r.id === requestId ? request : r
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      deleteRequest: (collectionId, requestId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  requests: c.requests.filter((r) => r.id !== requestId),
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      getCollection: (id) => {
        return get().collections.find((c) => c.id === id)
      },

      getRequest: (collectionId, requestId) => {
        const collection = get().collections.find((c) => c.id === collectionId)
        return collection?.requests.find((r) => r.id === requestId)
      },
    }),
    {
      name: 'collection-storage',
    }
  )
)
