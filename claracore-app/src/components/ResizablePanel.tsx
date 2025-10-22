import React, { useState } from 'react'

interface ResizablePanelProps {
  children: React.ReactNode
  defaultSize: number
  minSize: number
  maxSize: number
  direction: 'horizontal' | 'vertical'
  onResize?: (size: number) => void
}

export function ResizablePanel({
  children,
  defaultSize,
  minSize,
  maxSize,
  direction,
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY
    const startSize = size

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY
      const delta = currentPos - startPos
      const newSize = Math.max(minSize, Math.min(maxSize, startSize + delta))
      setSize(newSize)
      onResize?.(newSize)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="relative flex">
      <div
        style={
          direction === 'horizontal'
            ? { width: `${size}px` }
            : { height: `${size}px` }
        }
        className="overflow-hidden"
      >
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={`
          ${direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}
          bg-border hover:bg-primary transition-colors
        `}
      />
    </div>
  )
}
