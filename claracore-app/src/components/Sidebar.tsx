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
  FileText,
} from 'lucide-react'
import { useCollectionStore } from '../store/collection-store'
import { useHistoryStore } from '../store/history-store'
import { useRequestStore } from '../store/request-store'
import { formatDate } from '../lib/utils'

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('collections')
  const [searchQuery, setSearchQuery] = useState('')

  const collections = useCollectionStore((state) => state.collections)
  const addCollection = useCollectionStore((state) => state.addCollection)
  const history = useHistoryStore((state) => state.history)
  const loadRequest = useRequestStore((state) => state.loadRequest)

  const handleNewCollection = () => {
    const name = prompt('Collection name:')
    if (name) {
      addCollection(name)
    }
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
                  <div
                    key={collection.id}
                    className="p-2 rounded-md hover:bg-accent cursor-pointer border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{collection.name}</span>
                    </div>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        {collection.description}
                      </p>
                    )}
                    <div className="ml-6 mt-2 space-y-1">
                      {collection.requests.map((request) => (
                        <div
                          key={request.id}
                          onClick={() => loadRequest(request)}
                          className="flex items-center gap-2 p-1 rounded hover:bg-muted"
                        >
                          <FileText className="h-3 w-3" />
                          <span className="text-xs">{request.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {request.method}
                          </span>
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
    </div>
  )
}
