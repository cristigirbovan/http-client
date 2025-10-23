/**
 * Validation utilities for ClaraCore
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate a URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL cannot be empty' }
  }

  // Allow {{variable}} in URLs
  const withoutVariables = url.replace(/\{\{[^}]+\}\}/g, 'placeholder')

  try {
    // Check if it starts with http/https or is a valid URL
    if (!withoutVariables.match(/^https?:\/\//)) {
      return { valid: false, error: 'URL must start with http:// or https://' }
    }

    // Try to parse it
    new URL(withoutVariables)
    return { valid: true }
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validate JSON string
 */
export function validateJson(json: string): ValidationResult {
  if (!json || json.trim() === '') {
    return { valid: true } // Empty is valid
  }

  try {
    JSON.parse(json)
    return { valid: true }
  } catch (e) {
    const error = e as Error
    return { valid: false, error: `Invalid JSON: ${error.message}` }
  }
}

/**
 * Validate XML string (basic check)
 */
export function validateXml(xml: string): ValidationResult {
  if (!xml || xml.trim() === '') {
    return { valid: true } // Empty is valid
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    const parserError = doc.querySelector('parsererror')

    if (parserError) {
      return { valid: false, error: 'Invalid XML: ' + parserError.textContent }
    }

    return { valid: true }
  } catch (e) {
    const error = e as Error
    return { valid: false, error: `Invalid XML: ${error.message}` }
  }
}

/**
 * Validate collection name
 */
export function validateCollectionName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Collection name cannot be empty' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Collection name must be 100 characters or less' }
  }

  // Check for invalid characters (optional, can be relaxed)
  if (name.match(/[<>:"/\\|?*]/)) {
    return { valid: false, error: 'Collection name contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Validate request name
 */
export function validateRequestName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Request name cannot be empty' }
  }

  if (name.length > 200) {
    return { valid: false, error: 'Request name must be 200 characters or less' }
  }

  return { valid: true }
}

/**
 * Validate environment name
 */
export function validateEnvironmentName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Environment name cannot be empty' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Environment name must be 100 characters or less' }
  }

  return { valid: true }
}

/**
 * Validate variable name
 */
export function validateVariableName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Variable name cannot be empty' }
  }

  // Variable names should be valid identifiers
  if (!name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
    return {
      valid: false,
      error: 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores',
    }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Variable name must be 100 characters or less' }
  }

  return { valid: true }
}

/**
 * Validate port number
 */
export function validatePort(port: number | string): ValidationResult {
  const portNum = typeof port === 'string' ? parseInt(port) : port

  if (isNaN(portNum)) {
    return { valid: false, error: 'Port must be a number' }
  }

  if (portNum < 1 || portNum > 65535) {
    return { valid: false, error: 'Port must be between 1 and 65535' }
  }

  return { valid: true }
}

/**
 * Validate timeout
 */
export function validateTimeout(timeout: number | string): ValidationResult {
  const timeoutNum = typeof timeout === 'string' ? parseInt(timeout) : timeout

  if (isNaN(timeoutNum)) {
    return { valid: false, error: 'Timeout must be a number' }
  }

  if (timeoutNum < 0) {
    return { valid: false, error: 'Timeout cannot be negative' }
  }

  if (timeoutNum > 300000) {
    // 5 minutes
    return { valid: false, error: 'Timeout cannot exceed 300000ms (5 minutes)' }
  }

  return { valid: true }
}

/**
 * Validate email address (basic)
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email cannot be empty' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

/**
 * Validate header name
 */
export function validateHeaderName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: true } // Empty headers are allowed (can be disabled)
  }

  // HTTP header names should not contain spaces or special characters
  if (name.match(/[\s:]/)) {
    return { valid: false, error: 'Header name cannot contain spaces or colons' }
  }

  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSizeMB: number = 10): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Validate folder name
 */
export function validateFolderName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Folder name cannot be empty' }
  }

  if (name.length > 100) {
    return { valid: false, error: 'Folder name must be 100 characters or less' }
  }

  // Check for invalid characters
  if (name.match(/[<>:"/\\|?*]/)) {
    return { valid: false, error: 'Folder name contains invalid characters' }
  }

  return { valid: true }
}

/**
 * Sanitize input (remove potentially harmful content)
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '')
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  name: string = 'Value'
): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: `${name} must be a number` }
  }

  if (value < min || value > max) {
    return { valid: false, error: `${name} must be between ${min} and ${max}` }
  }

  return { valid: true }
}
