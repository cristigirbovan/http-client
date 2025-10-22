import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Collection, Request, Folder } from '../types'

interface CollectionState {
  collections: Collection[]

  addCollection: (name: string, description?: string) => void
  updateCollection: (id: string, name: string, description?: string) => void
  deleteCollection: (id: string) => void
  addRequest: (collectionId: string, request: Request, folderId?: string) => void
  updateRequest: (collectionId: string, requestId: string, request: Request) => void
  deleteRequest: (collectionId: string, requestId: string) => void
  addFolder: (collectionId: string, name: string, parentFolderId?: string) => void
  updateFolder: (collectionId: string, folderId: string, name: string, description?: string) => void
  deleteFolder: (collectionId: string, folderId: string) => void
  getCollection: (id: string) => Collection | undefined
  getRequest: (collectionId: string, requestId: string) => Request | undefined
  getFolder: (collectionId: string, folderId: string) => Folder | undefined
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
              folders: [],
              variables: [],
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

      addRequest: (collectionId, request, folderId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            if (!folderId) {
              // Add to root level
              return {
                ...c,
                requests: [...c.requests, request],
                updatedAt: Date.now(),
              }
            } else {
              // Add to folder
              return {
                ...c,
                folders: addRequestToFolder(c.folders, folderId, request),
                updatedAt: Date.now(),
              }
            }
          }),
        })),

      updateRequest: (collectionId, requestId, request) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            return {
              ...c,
              requests: c.requests.map((r) =>
                r.id === requestId ? request : r
              ),
              folders: updateRequestInFolders(c.folders, requestId, request),
              updatedAt: Date.now(),
            }
          }),
        })),

      deleteRequest: (collectionId, requestId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            return {
              ...c,
              requests: c.requests.filter((r) => r.id !== requestId),
              folders: deleteRequestFromFolders(c.folders, requestId),
              updatedAt: Date.now(),
            }
          }),
        })),

      addFolder: (collectionId, name, parentFolderId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            const newFolder: Folder = {
              id: uuidv4(),
              name,
              requests: [],
              folders: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }

            if (!parentFolderId) {
              // Add to root level
              return {
                ...c,
                folders: [...c.folders, newFolder],
                updatedAt: Date.now(),
              }
            } else {
              // Add to parent folder
              return {
                ...c,
                folders: addFolderToParent(c.folders, parentFolderId, newFolder),
                updatedAt: Date.now(),
              }
            }
          }),
        })),

      updateFolder: (collectionId, folderId, name, description) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            return {
              ...c,
              folders: updateFolderInFolders(c.folders, folderId, name, description),
              updatedAt: Date.now(),
            }
          }),
        })),

      deleteFolder: (collectionId, folderId) =>
        set((state) => ({
          collections: state.collections.map((c) => {
            if (c.id !== collectionId) return c

            return {
              ...c,
              folders: deleteFolderFromFolders(c.folders, folderId),
              updatedAt: Date.now(),
            }
          }),
        })),

      getCollection: (id) => {
        return get().collections.find((c) => c.id === id)
      },

      getRequest: (collectionId, requestId) => {
        const collection = get().collections.find((c) => c.id === collectionId)
        if (!collection) return undefined

        // Check root level
        const rootRequest = collection.requests.find((r) => r.id === requestId)
        if (rootRequest) return rootRequest

        // Check folders
        return findRequestInFolders(collection.folders, requestId)
      },

      getFolder: (collectionId, folderId) => {
        const collection = get().collections.find((c) => c.id === collectionId)
        if (!collection) return undefined

        return findFolderInFolders(collection.folders, folderId)
      },
    }),
    {
      name: 'collection-storage',
    }
  )
)

// Helper functions for nested folder operations

function addRequestToFolder(folders: Folder[], folderId: string, request: Request): Folder[] {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return {
        ...folder,
        requests: [...folder.requests, request],
        updatedAt: Date.now(),
      }
    }
    return {
      ...folder,
      folders: addRequestToFolder(folder.folders, folderId, request),
    }
  })
}

function updateRequestInFolders(folders: Folder[], requestId: string, request: Request): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    requests: folder.requests.map((r) => (r.id === requestId ? request : r)),
    folders: updateRequestInFolders(folder.folders, requestId, request),
  }))
}

function deleteRequestFromFolders(folders: Folder[], requestId: string): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    requests: folder.requests.filter((r) => r.id !== requestId),
    folders: deleteRequestFromFolders(folder.folders, requestId),
  }))
}

function addFolderToParent(folders: Folder[], parentId: string, newFolder: Folder): Folder[] {
  return folders.map((folder) => {
    if (folder.id === parentId) {
      return {
        ...folder,
        folders: [...folder.folders, newFolder],
        updatedAt: Date.now(),
      }
    }
    return {
      ...folder,
      folders: addFolderToParent(folder.folders, parentId, newFolder),
    }
  })
}

function updateFolderInFolders(
  folders: Folder[],
  folderId: string,
  name: string,
  description?: string
): Folder[] {
  return folders.map((folder) => {
    if (folder.id === folderId) {
      return {
        ...folder,
        name,
        description,
        updatedAt: Date.now(),
      }
    }
    return {
      ...folder,
      folders: updateFolderInFolders(folder.folders, folderId, name, description),
    }
  })
}

function deleteFolderFromFolders(folders: Folder[], folderId: string): Folder[] {
  return folders
    .filter((folder) => folder.id !== folderId)
    .map((folder) => ({
      ...folder,
      folders: deleteFolderFromFolders(folder.folders, folderId),
    }))
}

function findRequestInFolders(folders: Folder[], requestId: string): Request | undefined {
  for (const folder of folders) {
    const request = folder.requests.find((r) => r.id === requestId)
    if (request) return request

    const nestedRequest = findRequestInFolders(folder.folders, requestId)
    if (nestedRequest) return nestedRequest
  }
  return undefined
}

function findFolderInFolders(folders: Folder[], folderId: string): Folder | undefined {
  for (const folder of folders) {
    if (folder.id === folderId) return folder

    const nestedFolder = findFolderInFolders(folder.folders, folderId)
    if (nestedFolder) return nestedFolder
  }
  return undefined
}
