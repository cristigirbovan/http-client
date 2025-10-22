import { AlertTriangle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ScriptErrorBannerProps {
  error: string | null
  onDismiss: () => void
}

export default function ScriptErrorBanner({ error, onDismiss }: ScriptErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
    }
  }, [error])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for fade out animation
  }

  if (!error || !isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />

          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-yellow-500">Script Execution Warning</h4>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              The request will continue without script execution.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-yellow-500/20 rounded transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
