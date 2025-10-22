import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  FolderPlus,
  History,
  Settings,
  Cloud,
  Search,
  Plus,
  Folder,
  FolderOpen,
  FileText,
  MoreVertical,
  Edit,
  Trash,
  Play,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useCollectionStore } from '../store/collection-store'
import { useHistoryStore } from '../store/history-store'
import { useRequestStore } from '../store/request-store'
import { formatDate } from '../lib/utils'
import { Folder as FolderType, Request } from '../types'

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('collections')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    type: 'collection' | 'folder' | 'request'
    id: string
    x: number
    y: number
  } | null>(null)

  const collections = useCollectionStore((state) => state.collections)
  const addCollection = useCollectionStore((state) => state.addCollection)
  const deleteCollection = useCollectionStore((state) => state.deleteCollection)
  const addFolder = useCollectionStore((state) => state.addFolder)
  const deleteFolder = useCollectionStore((state) => state.deleteFolder)
  const deleteRequest = useCollectionStore((state) => state.deleteRequest)
  const history = useHistoryStore((state) => state.history)
  const loadRequest = useRequestStore((state) => state.loadRequest)

  const handleNewCollection = () => {
    const name = prompt('Collection name:')
    if (name) {
      addCollection(name)
    }
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleNewFolder = (collectionId: string, parentFolderId?: string) => {
    const name = prompt('Folder name:')
    if (name) {
      addFolder(collectionId, name, parentFolderId)
    }
  }

  const handleContextMenu = (
    e: React.MouseEvent,
    type: 'collection' | 'folder' | 'request',
    id: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ type, id, x: e.clientX, y: e.clientY })
  }

  const handleDeleteCollection = (id: string) => {
    if (confirm('Delete this collection? This cannot be undone.')) {
      deleteCollection(id)
    }
    setContextMenu(null)
  }

  const handleDeleteFolder = (collectionId: string, folderId: string) => {
    if (confirm('Delete this folder and all its contents? This cannot be undone.')) {
      deleteFolder(collectionId, folderId)
    }
    setContextMenu(null)
  }

  const handleDeleteRequest = (collectionId: string, requestId: string) => {
    if (confirm('Delete this request?')) {
      deleteRequest(collectionId, requestId)
    }
    setContextMenu(null)
  }

  // Recursive folder renderer
  const renderFolder = (folder: FolderType, collectionId: string, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const paddingLeft = `${depth * 12 + 24}px`

    return (
      <div key={folder.id}>
        <div
          className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer group"
          style={{ paddingLeft }}
          onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
        >
          <button onClick={() => toggleFolder(folder.id)} className="p-0.5">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="h-3 w-3 text-yellow-500" />
          ) : (
            <Folder className="h-3 w-3 text-yellow-500" />
          )}
          <span className="text-xs flex-1">{folder.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNewFolder(collectionId, folder.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded"
            title="New folder"
          >
            <FolderPlus className="h-3 w-3" />
          </button>
        </div>

        {isExpanded && (
          <div>
            {/* Nested folders */}
            {folder.folders.map((subfolder) => renderFolder(subfolder, collectionId, depth + 1))}

            {/* Requests in this folder */}
            {folder.requests.map((request) => (
              <div
                key={request.id}
                onClick={() => loadRequest(request)}
                onContextMenu={(e) => handleContextMenu(e, 'request', request.id)}
                className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer group"
                style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
              >
                <FileText className="h-3 w-3" />
                <span className="text-xs flex-1 truncate">{request.name}</span>
                <span className="text-xs text-muted-foreground">{request.method}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary">☕ ClaraCore</h1>
        <p className="text-xs text-muted-foreground mt-1">HTTP Client for Java Developers</p>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-2 py-2">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="collections" className="text-xs">
              <Folder className="h-3 w-3 mr-1" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="environments" className="text-xs">
              <Cloud className="h-3 w-3 mr-1" />
              Envs
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="collections" className="p-3 space-y-2">
            <Button
              onClick={handleNewCollection}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>

            {collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No collections yet.
                <br />
                Create one to get started!
              </div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div key={collection.id} className="border border-border rounded-md">
                    <div
                      className="p-2 hover:bg-accent cursor-pointer group"
                      onContextMenu={(e) => handleContextMenu(e, 'collection', collection.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium flex-1">{collection.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNewFolder(collection.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                          title="New folder"
                        >
                          <FolderPlus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Open collection runner
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded"
                          title="Run collection"
                        >
                          <Play className="h-3 w-3" />
                        </button>
                      </div>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {collection.description}
                        </p>
                      )}
                    </div>

                    <div className="pb-2">
                      {/* Render folders */}
                      {collection.folders.map((folder) => renderFolder(folder, collection.id))}

                      {/* Render root-level requests */}
                      {collection.requests.map((request) => (
                        <div
                          key={request.id}
                          onClick={() => loadRequest(request)}
                          onContextMenu={(e) => handleContextMenu(e, 'request', request.id)}
                          className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer ml-6 mr-2"
                        >
                          <FileText className="h-3 w-3" />
                          <span className="text-xs flex-1 truncate">{request.name}</span>
                          <span className="text-xs text-muted-foreground">{request.method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-3 space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No history yet.
                <br />
                Make a request to see it here!
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => loadRequest(entry.request)}
                    className="p-2 rounded-md hover:bg-accent cursor-pointer border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {entry.request.method}
                      </span>
                      <span className="text-xs truncate flex-1">
                        {entry.request.url || 'Untitled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span
                        className={
                          entry.response.status >= 200 && entry.response.status < 300
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {entry.response.status}
                      </span>
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="environments" className="p-3">
            <div className="text-center py-8 text-muted-foreground text-sm">
              Environment management coming soon!
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 w-48 bg-popover border border-border rounded-md shadow-lg p-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === 'collection' && (
              <>
                <button
                  onClick={() => {
                    handleNewFolder(contextMenu.id)
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  <FolderPlus className="h-4 w-4" />
                  New Folder
                </button>
                <button
                  onClick={() => {
                    // TODO: Open collection runner
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  <Play className="h-4 w-4" />
                  Run Collection
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => handleDeleteCollection(contextMenu.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-destructive/10 text-destructive rounded"
                >
                  <Trash className="h-4 w-4" />
                  Delete Collection
                </button>
              </>
            )}

            {contextMenu.type === 'folder' && (
              <>
                <button
                  onClick={() => {
                    // Find collection ID - we need to pass it
                    // For now, just close the menu
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  <FolderPlus className="h-4 w-4" />
                  New Subfolder
                </button>
                <button
                  onClick={() => {
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  <Edit className="h-4 w-4" />
                  Rename
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    // Need to find collection ID
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-destructive/10 text-destructive rounded"
                >
                  <Trash className="h-4 w-4" />
                  Delete Folder
                </button>
              </>
            )}

            {contextMenu.type === 'request' && (
              <>
                <button
                  onClick={() => {
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded"
                >
                  <Edit className="h-4 w-4" />
                  Rename
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    // Need collection ID
                    setContextMenu(null)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-destructive/10 text-destructive rounded"
                >
                  <Trash className="h-4 w-4" />
                  Delete Request
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
