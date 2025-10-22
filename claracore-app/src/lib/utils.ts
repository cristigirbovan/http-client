import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

export function parseJSON(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export function stringifyJSON(obj: any, pretty = true): string {
  try {
    return JSON.stringify(obj, null, pretty ? 2 : 0)
  } catch {
    return String(obj)
  }
}

export function replaceVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] || `{{${key}}}`
  })
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
  if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400'
  if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400'
  if (status >= 500) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
