import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { X, FolderOpen } from 'lucide-react'
import { useCollectionStore } from '../store/collection-store'
import { Request, Folder } from '../types'

interface SaveRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: Request
}

export default function SaveRequestModal({ isOpen, onClose, request }: SaveRequestModalProps) {
  const collections = useCollectionStore((state) => state.collections)
  const addRequest = useCollectionStore((state) => state.addRequest)
  const updateRequest = useCollectionStore((state) => state.updateRequest)

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [requestName, setRequestName] = useState(request.name || 'New Request')
  const [isUpdate, setIsUpdate] = useState(false)

  useEffect(() => {
    if (isOpen && collections.length > 0) {
      setSelectedCollectionId(collections[0].id)
      setRequestName(request.name || 'New Request')

      // Check if this request already exists in a collection
      const existingCollection = collections.find(c =>
        c.requests.some(r => r.id === request.id) ||
        findRequestInFolders(c.folders, request.id)
      )

      if (existingCollection) {
        setIsUpdate(true)
        setSelectedCollectionId(existingCollection.id)
      } else {
        setIsUpdate(false)
      }
    }
  }, [isOpen, collections, request])

  const findRequestInFolders = (folders: Folder[], requestId: string): boolean => {
    for (const folder of folders) {
      if (folder.requests.some(r => r.id === requestId)) return true
      if (findRequestInFolders(folder.folders, requestId)) return true
    }
    return false
  }

  const getAllFolders = (collectionId: string): Array<{ id: string; name: string; path: string }> => {
    const collection = collections.find(c => c.id === collectionId)
    if (!collection) return []

    const folders: Array<{ id: string; name: string; path: string }> = []

    const traverse = (folderList: Folder[], path: string = '') => {
      for (const folder of folderList) {
        const folderPath = path ? `${path} / ${folder.name}` : folder.name
        folders.push({ id: folder.id, name: folder.name, path: folderPath })
        traverse(folder.folders, folderPath)
      }
    }

    traverse(collection.folders)
    return folders
  }

  const handleSave = () => {
    if (!selectedCollectionId) {
      alert('Please select a collection')
      return
    }

    if (!requestName.trim()) {
      alert('Please enter a request name')
      return
    }

    const requestToSave = {
      ...request,
      name: requestName.trim(),
      updatedAt: Date.now(),
    }

    if (isUpdate) {
      updateRequest(selectedCollectionId, request.id, requestToSave)
    } else {
      addRequest(selectedCollectionId, requestToSave, selectedFolderId || undefined)
    }

    onClose()
  }

  if (!isOpen) return null

  const availableFolders = selectedCollectionId ? getAllFolders(selectedCollectionId) : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-[500px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {isUpdate ? 'Update Request' : 'Save Request to Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No collections available.</p>
              <p className="text-sm mt-2">Create a collection first to save requests.</p>
            </div>
          ) : (
            <>
              {/* Request Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Request Name</label>
                <Input
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Enter request name"
                  autoFocus
                />
              </div>

              {/* Collection Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection</label>
                <Select
                  value={selectedCollectionId}
                  onChange={(e) => {
                    setSelectedCollectionId(e.target.value)
                    setSelectedFolderId('') // Reset folder when collection changes
                  }}
                  disabled={isUpdate}
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
                {isUpdate && (
                  <p className="text-xs text-muted-foreground">
                    Cannot change collection when updating
                  </p>
                )}
              </div>

              {/* Folder Selection (Optional) */}
              {!isUpdate && availableFolders.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Folder <span className="text-muted-foreground">(Optional)</span>
                  </label>
                  <Select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                  >
                    <option value="">Root (no folder)</option>
                    {availableFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.path}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Request Info */}
              <div className="p-3 bg-muted rounded-md space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {request.method}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {request.url || 'No URL'}
                  </span>
                </div>
                {request.body?.type !== 'none' && (
                  <div className="text-xs text-muted-foreground">
                    Body: {request.body?.type}
                  </div>
                )}
                {request.auth?.type !== 'none' && (
                  <div className="text-xs text-muted-foreground">
                    Auth: {request.auth?.type}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {collections.length > 0 && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isUpdate ? 'Update' : 'Save'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
