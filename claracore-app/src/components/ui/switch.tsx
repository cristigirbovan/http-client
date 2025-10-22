import { useState } from 'react'

interface SwitchProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Switch({
  id,
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(checked)

  const isChecked = checked !== undefined ? checked : internalChecked

  const handleClick = () => {
    if (disabled) return
    const newValue = !isChecked
    setInternalChecked(newValue)
    onCheckedChange?.(newValue)
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${isChecked ? 'bg-primary' : 'bg-muted'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-background transition-transform
          ${isChecked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}
