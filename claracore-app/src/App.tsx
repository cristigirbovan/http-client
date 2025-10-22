import { useState } from 'react'
import Sidebar from './components/Sidebar'
import RequestPanel from './components/RequestPanel'
import ResponsePanel from './components/ResponsePanel'
import { ResizablePanel } from './components/ResizablePanel'

function App() {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [responseHeight, setResponseHeight] = useState(50) // percentage

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
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
  )
}

export default App
