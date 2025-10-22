import { useState, useEffect, useRef } from 'react'
import { X, Search, FileText, Folder, History, Settings, Command } from 'lucide-react'
import { GlobalSearch, SearchResult } from '../lib/global-search'
import { useCollectionStore } from '../store/collection-store'
import { useHistoryStore } from '../store/history-store'
import { useEnvironmentStore } from '../store/environment-store'
import { Input } from './ui/input'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRequest?: (requestId: string, collectionId?: string) => void
}

export default function GlobalSearchModal({ isOpen, onClose, onSelectRequest }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const collections = useCollectionStore((state) => state.collections)
  const history = useHistoryStore((state) => state.history)
  const environments = useEnvironmentStore((state) => state.environments)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (query.trim()) {
      const searchResults = GlobalSearch.search(collections, history, environments, {
        query: query.trim(),
        matchMethod: 'fuzzy',
        caseSensitive: false,
        limit: 50,
      })
      setResults(searchResults)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [query, collections, history, environments])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelectResult(results[selectedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    if (!result) return

    if (result.type === 'request' && onSelectRequest) {
      onSelectRequest(result.id, result.parent?.id)
    }
    // Could add more handlers for other types

    onClose()
  }

  if (!isOpen) return null

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'request':
        return <FileText className="h-4 w-4" />
      case 'collection':
        return <Folder className="h-4 w-4" />
      case 'folder':
        return <Folder className="h-4 w-4" />
      case 'history':
        return <History className="h-4 w-4" />
      case 'environment':
        return <Settings className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'request':
        return 'text-blue-500'
      case 'collection':
        return 'text-purple-500'
      case 'folder':
        return 'text-yellow-500'
      case 'history':
        return 'text-green-500'
      case 'environment':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-background border border-border rounded-lg w-[700px] max-h-[600px] flex flex-col shadow-xl">
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search collections, requests, history, environments..."
              className="flex-1 border-0 focus:ring-0 px-0"
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && query.trim() && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          )}

          {results.length === 0 && !query.trim() && (
            <div className="p-8 text-center text-muted-foreground">
              <Command className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold">Quick Search</p>
              <p className="text-sm mt-2">Search across all collections, requests, and more</p>
              <div className="mt-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <p><strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use fuzzy search: "usrlgn" finds "user login"</li>
                  <li>Search URLs, methods, headers, body content</li>
                  <li>Results sorted by relevance</li>
                  <li>Use ↑↓ arrows to navigate, Enter to select</li>
                </ul>
              </div>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 ${
                index === selectedIndex ? 'bg-muted/50' : ''
              }`}
              onClick={() => handleSelectResult(result)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getTypeColor(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{result.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(result.type)} bg-current/10`}>
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {result.description}
                    </p>
                  )}
                  {result.parent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      in {result.parent.type === 'collection' ? '📁' : '📂'} {result.parent.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Matched: {result.matchedFields.join(', ')}</span>
                    <span>•</span>
                    <span>Score: {result.relevance}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="p-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{results.length} results</span>
              <span>↑↓ Navigate</span>
              <span>Enter Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
