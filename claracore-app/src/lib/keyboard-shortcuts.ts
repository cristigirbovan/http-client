/**
 * Keyboard Shortcuts System for ClaraCore
 * Postman-like keyboard shortcuts
 */

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Cmd on Mac
  description: string
  action: () => void
  category: string
}

export class KeyboardShortcutManager {
  private static instance: KeyboardShortcutManager
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private enabled = true

  private constructor() {
    this.setupEventListeners()
  }

  static getInstance(): KeyboardShortcutManager {
    if (!KeyboardShortcutManager.instance) {
      KeyboardShortcutManager.instance = new KeyboardShortcutManager()
    }
    return KeyboardShortcutManager.instance
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    this.shortcuts.set(key, shortcut)
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string) {
    this.shortcuts.delete(key)
  }

  /**
   * Enable/disable keyboard shortcuts
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.getAllShortcuts().filter(s => s.category === category)
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners() {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', (event) => {
      if (!this.enabled) return

      // Don't trigger shortcuts when typing in input fields (except specific cases)
      const target = event.target as HTMLElement
      const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
        target.isContentEditable

      // Allow Ctrl+Enter in input fields for sending requests
      if (isInputField && !(event.ctrlKey && event.key === 'Enter')) {
        return
      }

      const key = this.getEventKey(event)
      const shortcut = this.shortcuts.get(key)

      if (shortcut) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.action()
      }
    })
  }

  /**
   * Generate unique key for a shortcut
   */
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.shift) parts.push('shift')
    if (shortcut.alt) parts.push('alt')
    if (shortcut.meta) parts.push('meta')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * Generate key from keyboard event
   */
  private getEventKey(event: KeyboardEvent): string {
    const parts: string[] = []
    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    parts.push(event.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * Format shortcut for display
   */
  static formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')

    if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl')
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift')
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt')

    // Format key name
    const keyName = shortcut.key.toUpperCase()
    parts.push(keyName)

    return parts.join(isMac ? '' : '+')
  }
}

/**
 * Default ClaraCore shortcuts (Postman-compatible)
 */
export const defaultShortcuts = {
  // Request Actions
  SEND_REQUEST: {
    key: 'Enter',
    ctrl: true,
    description: 'Send request',
    category: 'Request',
  },
  SAVE_REQUEST: {
    key: 's',
    ctrl: true,
    description: 'Save request',
    category: 'Request',
  },
  CANCEL_REQUEST: {
    key: 'Escape',
    description: 'Cancel request',
    category: 'Request',
  },

  // Navigation
  NEW_REQUEST: {
    key: 'n',
    ctrl: true,
    description: 'New request',
    category: 'Navigation',
  },
  NEW_TAB: {
    key: 't',
    ctrl: true,
    description: 'New tab',
    category: 'Navigation',
  },
  CLOSE_TAB: {
    key: 'w',
    ctrl: true,
    description: 'Close tab',
    category: 'Navigation',
  },
  SWITCH_TAB_NEXT: {
    key: 'Tab',
    ctrl: true,
    description: 'Next tab',
    category: 'Navigation',
  },
  SWITCH_TAB_PREV: {
    key: 'Tab',
    ctrl: true,
    shift: true,
    description: 'Previous tab',
    category: 'Navigation',
  },

  // Search
  FOCUS_SEARCH: {
    key: 'f',
    ctrl: true,
    description: 'Focus search',
    category: 'Search',
  },
  GLOBAL_SEARCH: {
    key: 'k',
    ctrl: true,
    description: 'Global search',
    category: 'Search',
  },

  // View
  TOGGLE_SIDEBAR: {
    key: 'b',
    ctrl: true,
    description: 'Toggle sidebar',
    category: 'View',
  },
  TOGGLE_CONSOLE: {
    key: 'j',
    ctrl: true,
    description: 'Toggle console',
    category: 'View',
  },
  FOCUS_URL: {
    key: 'l',
    ctrl: true,
    description: 'Focus URL bar',
    category: 'View',
  },

  // Code
  GENERATE_CODE: {
    key: 'g',
    ctrl: true,
    shift: true,
    description: 'Generate code',
    category: 'Code',
  },
  FORMAT_JSON: {
    key: 'b',
    ctrl: true,
    shift: true,
    description: 'Beautify/Format JSON',
    category: 'Code',
  },

  // Collections
  NEW_COLLECTION: {
    key: 'c',
    ctrl: true,
    shift: true,
    description: 'New collection',
    category: 'Collections',
  },
  NEW_FOLDER: {
    key: 'f',
    ctrl: true,
    shift: true,
    description: 'New folder',
    category: 'Collections',
  },
  RUN_COLLECTION: {
    key: 'r',
    ctrl: true,
    shift: true,
    description: 'Run collection',
    category: 'Collections',
  },

  // Environment
  SWITCH_ENVIRONMENT: {
    key: 'e',
    ctrl: true,
    description: 'Switch environment',
    category: 'Environment',
  },
  MANAGE_ENVIRONMENTS: {
    key: 'e',
    ctrl: true,
    shift: true,
    description: 'Manage environments',
    category: 'Environment',
  },

  // History
  SHOW_HISTORY: {
    key: 'h',
    ctrl: true,
    description: 'Show history',
    category: 'History',
  },

  // Help
  SHOW_SHORTCUTS: {
    key: '/',
    ctrl: true,
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
  SHOW_HELP: {
    key: 'F1',
    description: 'Show help',
    category: 'Help',
  },

  // Editing
  DUPLICATE: {
    key: 'd',
    ctrl: true,
    description: 'Duplicate',
    category: 'Editing',
  },
  DELETE: {
    key: 'Delete',
    description: 'Delete',
    category: 'Editing',
  },
  RENAME: {
    key: 'F2',
    description: 'Rename',
    category: 'Editing',
  },

  // Window
  ZOOM_IN: {
    key: '=',
    ctrl: true,
    description: 'Zoom in',
    category: 'Window',
  },
  ZOOM_OUT: {
    key: '-',
    ctrl: true,
    description: 'Zoom out',
    category: 'Window',
  },
  ZOOM_RESET: {
    key: '0',
    ctrl: true,
    description: 'Reset zoom',
    category: 'Window',
  },
}

export const keyboardShortcuts = KeyboardShortcutManager.getInstance()
