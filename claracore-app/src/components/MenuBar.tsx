import { useState } from 'react'
import {
  Menu,
  FileDown,
  FileUp,
  Search,
  Play,
  Keyboard,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

interface MenuBarProps {
  onOpenImportExport?: () => void
  onOpenGlobalSearch?: () => void
  onOpenCollectionRunner?: () => void
  onOpenShortcuts?: () => void
  onOpenSettings?: () => void
}

export default function MenuBar({
  onOpenImportExport,
  onOpenGlobalSearch,
  onOpenCollectionRunner,
  onOpenShortcuts,
  onOpenSettings,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const closeMenu = () => setActiveMenu(null)

  const MenuItem = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
  }: {
    icon: any
    label: string
    shortcut?: string
    onClick: () => void
  }) => (
    <button
      onClick={() => {
        onClick()
        closeMenu()
      }}
      className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent rounded transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      {shortcut && (
        <kbd className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </button>
  )

  const MenuButton = ({ label, menuKey }: { label: string; menuKey: string }) => (
    <button
      onClick={() => setActiveMenu(activeMenu === menuKey ? null : menuKey)}
      className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded transition-colors ${
        activeMenu === menuKey ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  )

  return (
    <div className="h-10 bg-card border-b border-border px-2 flex items-center gap-1 relative">
      {/* File Menu */}
      <div className="relative">
        <MenuButton label="File" menuKey="file" />
        {activeMenu === 'file' && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-lg z-50 p-1">
            <MenuItem
              icon={FileUp}
              label="Import Collection"
              shortcut="Ctrl+Shift+I"
              onClick={() => onOpenImportExport?.()}
            />
            <MenuItem
              icon={FileDown}
              label="Export Collection"
              onClick={() => onOpenImportExport?.()}
            />
            <div className="h-px bg-border my-1" />
            <MenuItem icon={Settings} label="Settings" onClick={() => onOpenSettings?.()} />
          </div>
        )}
      </div>

      {/* Tools Menu */}
      <div className="relative">
        <MenuButton label="Tools" menuKey="tools" />
        {activeMenu === 'tools' && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-lg z-50 p-1">
            <MenuItem
              icon={Search}
              label="Global Search"
              shortcut="Ctrl+K"
              onClick={() => onOpenGlobalSearch?.()}
            />
            <MenuItem
              icon={Play}
              label="Collection Runner"
              onClick={() => onOpenCollectionRunner?.()}
            />
            <div className="h-px bg-border my-1" />
            <MenuItem
              icon={Keyboard}
              label="Keyboard Shortcuts"
              shortcut="Ctrl+/"
              onClick={() => onOpenShortcuts?.()}
            />
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <MenuButton label="Help" menuKey="help" />
        {activeMenu === 'help' && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-md shadow-lg z-50 p-1">
            <MenuItem
              icon={Keyboard}
              label="Keyboard Shortcuts"
              shortcut="Ctrl+/"
              onClick={() => onOpenShortcuts?.()}
            />
            <MenuItem
              icon={HelpCircle}
              label="Documentation"
              onClick={() => window.open('https://github.com/yourusername/claracore', '_blank')}
            />
            <div className="h-px bg-border my-1" />
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <div>ClaraCore v1.0.0</div>
              <div className="mt-1">HTTP Client for Java Developers</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions (right side) */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onOpenGlobalSearch?.()}
          className="p-1.5 rounded hover:bg-accent transition-colors"
          title="Global Search (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={() => onOpenShortcuts?.()}
          className="p-1.5 rounded hover:bg-accent transition-colors"
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      {/* Click outside to close */}
      {activeMenu && (
        <div className="fixed inset-0 z-40" onClick={closeMenu} />
      )}
    </div>
  )
}
