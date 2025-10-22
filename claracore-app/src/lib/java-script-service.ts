import axios from 'axios'

/**
 * Script execution request
 */
export interface ScriptRequest {
  script: string
  context: Record<string, any>
  type?: 'pre-request' | 'test'
}

/**
 * Script execution response
 */
export interface ScriptResponse {
  success: boolean
  error?: string
  consoleOutput: string[]
  updatedVariables: Record<string, any>
  testResults: TestResult[]
  executionTime: number
}

export interface TestResult {
  name: string
  passed: boolean
  message: string
}

/**
 * Service for communicating with Java sidecar for script execution
 */
export class JavaScriptService {
  private static baseUrl: string = 'http://localhost:9090'
  private static isInitialized: boolean = false

  /**
   * Initialize the service (get Java sidecar URL from Electron)
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check if we're running in Electron
      if (window.electronAPI?.javaGetUrl) {
        this.baseUrl = await window.electronAPI.javaGetUrl()
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize JavaScriptService:', error)
      // Use default URL
      this.isInitialized = true
    }
  }

  /**
   * Check if Java sidecar is running
   */
  static async isRunning(): Promise<boolean> {
    try {
      if (window.electronAPI?.javaIsRunning) {
        return await window.electronAPI.javaIsRunning()
      }

      // Fallback: try health check
      const response = await axios.get(`${this.baseUrl}/api/scripts/health`, {
        timeout: 1000,
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  /**
   * Execute a pre-request script
   */
  static async executePreRequestScript(
    script: string,
    context: Record<string, any>
  ): Promise<ScriptResponse> {
    await this.initialize()

    try {
      const response = await axios.post<ScriptResponse>(
        `${this.baseUrl}/api/scripts/pre-request`,
        {
          script,
          context,
          type: 'pre-request',
        } as ScriptRequest,
        {
          timeout: 30000, // 30 seconds
        }
      )

      return response.data
    } catch (error) {
      console.error('Pre-request script execution failed:', error)
      throw new Error(
        `Failed to execute pre-request script: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Execute a test script
   */
  static async executeTestScript(
    script: string,
    context: Record<string, any>
  ): Promise<ScriptResponse> {
    await this.initialize()

    try {
      const response = await axios.post<ScriptResponse>(
        `${this.baseUrl}/api/scripts/test`,
        {
          script,
          context,
          type: 'test',
        } as ScriptRequest,
        {
          timeout: 30000, // 30 seconds
        }
      )

      return response.data
    } catch (error) {
      console.error('Test script execution failed:', error)
      throw new Error(
        `Failed to execute test script: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Execute any script (generic)
   */
  static async executeScript(request: ScriptRequest): Promise<ScriptResponse> {
    await this.initialize()

    try {
      const response = await axios.post<ScriptResponse>(
        `${this.baseUrl}/api/scripts/execute`,
        request,
        {
          timeout: 30000, // 30 seconds
        }
      )

      return response.data
    } catch (error) {
      console.error('Script execution failed:', error)
      throw new Error(
        `Failed to execute script: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/scripts/health`, {
        timeout: 2000,
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}
