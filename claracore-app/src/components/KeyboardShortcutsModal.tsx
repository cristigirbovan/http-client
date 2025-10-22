import { X, Keyboard } from 'lucide-react'
import { Button } from './ui/button'
import { defaultShortcuts, KeyboardShortcutManager } from '../lib/keyboard-shortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  // Group shortcuts by category
  const categories: Record<string, any[]> = {}
  Object.entries(defaultShortcuts).forEach(([key, shortcut]) => {
    if (!categories[shortcut.category]) {
      categories[shortcut.category] = []
    }
    categories[shortcut.category].push({ ...shortcut, key })
  })

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')

  const formatKey = (shortcut: any) => {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl')
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift')
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(isMac ? '' : '+')
  }

  const categoryOrder = [
    'Request',
    'Navigation',
    'Search',
    'View',
    'Code',
    'Collections',
    'Environment',
    'History',
    'Editing',
    'Window',
    'Help',
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-[900px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {categoryOrder.map((category) => {
              if (!categories[category]) return null
              return (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categories[category].map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                          {formatKey(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Platform Note */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
            <p className="text-sm text-blue-400">
              <strong>Platform:</strong> {isMac ? 'macOS' : 'Windows/Linux'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isMac
                ? 'Shortcuts shown with ⌘ (Command), ⇧ (Shift), ⌥ (Option) keys'
                : 'Shortcuts shown with Ctrl, Shift, Alt keys'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+/</kbd> anytime to see this
            dialog
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
