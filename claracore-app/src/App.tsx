import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import MenuBar from './components/MenuBar'
import RequestPanel from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import { ResizablePanel } from './components/ResizablePanel'
import CollectionRunnerModal from './components/CollectionRunnerModal'
import ImportExportModal from './components/ImportExportModal'
import GlobalSearchModal from './components/GlobalSearchModal'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import { KeyboardShortcutManager, defaultShortcuts } from './lib/keyboard-shortcuts'
import { useCollectionStore } from './store/collection-store'
import { useRequestStore } from './store/request-store'
import { Folder } from './types'

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [responseHeight, setResponseHeight] = useState(50) // percentage

  // Modal visibility states
  const [isRunnerOpen, setIsRunnerOpen] = useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [selectedCollectionForRunner, setSelectedCollectionForRunner] = useState<string | null>(null)

  const collections = useCollectionStore((state) => state.collections)
  const getCollection = useCollectionStore((state) => state.getCollection)
  const loadRequest = useRequestStore((state) => state.loadRequest)

  // Initialize keyboard shortcuts
  useEffect(() => {
    const shortcutManager = KeyboardShortcutManager.getInstance()

    // Global Search (Ctrl+K)
    shortcutManager.register({
      ...defaultShortcuts.GLOBAL_SEARCH,
      action: () => setIsSearchOpen(true),
    })

    // Keyboard Shortcuts Help (Ctrl+/)
    shortcutManager.register({
      ...defaultShortcuts.SHOW_SHORTCUTS,
      action: () => setIsShortcutsOpen(true),
    })

    // Import/Export (Ctrl+Shift+I)
    shortcutManager.register({
      key: 'i',
      ctrl: true,
      shift: true,
      description: 'Import/Export',
      category: 'Collections',
      action: () => setIsImportExportOpen(true),
    })

    return () => {
      shortcutManager.unregisterAll()
    }
  }, [])

  // Handle request selection from global search
  const handleSelectRequest = (requestId: string, collectionId?: string) => {
    if (!collectionId) return

    const collection = getCollection(collectionId)
    if (!collection) return

    // Search in root-level requests
    const rootRequest = collection.requests.find(r => r.id === requestId)
    if (rootRequest) {
      loadRequest(rootRequest)
      setIsSearchOpen(false)
      return
    }

    // Search in folders recursively
    const findRequestInFolders = (folders: Folder[]): boolean => {
      for (const folder of folders) {
        const request = folder.requests.find(r => r.id === requestId)
        if (request) {
          loadRequest(request)
          setIsSearchOpen(false)
          return true
        }
        if (findRequestInFolders(folder.folders)) {
          return true
        }
      }
      return false
    }

    findRequestInFolders(collection.folders)
  }

  // Open collection runner for specific collection
  const openCollectionRunner = (collectionId: string) => {
    setSelectedCollectionForRunner(collectionId)
    setIsRunnerOpen(true)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Menu Bar */}
      <MenuBar
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenGlobalSearch={() => setIsSearchOpen(true)}
        onOpenCollectionRunner={() => setIsRunnerOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => console.log('Settings not implemented yet')}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ResizablePanel
          defaultSize={sidebarWidth}
          minSize={200}
          maxSize={500}
          direction="horizontal"
          onResize={setSidebarWidth}
        >
          <Sidebar />
        </ResizablePanel>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Request Panel */}
        <div
          className="overflow-hidden"
          style={{ height: `${100 - responseHeight}%` }}
        >
          <RequestPanel />
        </div>

        {/* Resize Handle */}
        <div
          className="h-1 bg-border hover:bg-primary cursor-row-resize transition-colors"
          onMouseDown={(e) => {
            e.preventDefault()
            const startY = e.clientY
            const startHeight = responseHeight

            const handleMouseMove = (e: MouseEvent) => {
              const deltaY = e.clientY - startY
              const containerHeight = window.innerHeight
              const newHeight = startHeight + (deltaY / containerHeight) * 100
              setResponseHeight(Math.max(20, Math.min(80, newHeight)))
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />

        {/* Response Panel */}
        <div
          className="overflow-hidden"
          style={{ height: `${responseHeight}%` }}
        >
          <ResponsePanel />
        </div>
        </div>
      </div>

      {/* Global Modals */}
      <CollectionRunnerModal
        collection={selectedCollectionForRunner ? getCollection(selectedCollectionForRunner) : undefined}
        isOpen={isRunnerOpen}
        onClose={() => {
          setIsRunnerOpen(false)
          setSelectedCollectionForRunner(null)
        }}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRequest={handleSelectRequest}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  )
}

export default App
