import {
  Collection,
  CollectionRunConfig,
  CollectionRunResult,
  RequestRunResult,
  Request,
  Folder
} from '../types'
import { httpClient } from './http-client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Collection Runner - Execute collections with iterations, delays, and data files
 */
export class CollectionRunner {
  private static instance: CollectionRunner
  private isRunning = false
  private shouldStop = false

  private constructor() {}

  static getInstance(): CollectionRunner {
    if (!CollectionRunner.instance) {
      CollectionRunner.instance = new CollectionRunner()
    }
    return CollectionRunner.instance
  }

  /**
   * Run a collection with the specified configuration
   */
  async runCollection(
    collection: Collection,
    config: CollectionRunConfig,
    environmentVariables: Record<string, string> = {},
    onProgress?: (result: RequestRunResult) => void
  ): Promise<CollectionRunResult> {
    if (this.isRunning) {
      throw new Error('Collection runner is already running')
    }

    this.isRunning = true
    this.shouldStop = false

    const startTime = Date.now()
    const results: RequestRunResult[] = []
    let successfulRequests = 0
    let failedRequests = 0

    try {
      // Get all requests to run
      const requests = this.getRequestsToRun(collection, config)

      if (requests.length === 0) {
        throw new Error('No requests selected for this run')
      }

      // Determine iterations
      const iterations = config.dataFile?.data.length || config.iterations

      // Run iterations
      for (let iteration = 0; iteration < iterations; iteration++) {
        // Get data for this iteration
        const iterationData = config.dataFile?.data[iteration] || {}

        // Merge environment variables with iteration data
        const variables = { ...environmentVariables, ...iterationData }

        // Run each request
        for (const request of requests) {
          if (this.shouldStop) {
            break
          }

          try {
            // Execute request
            const response = await httpClient.sendRequest(request, variables)

            const requestResult: RequestRunResult = {
              requestId: request.id,
              requestName: request.name,
              iteration: iteration + 1,
              dataRow: Object.keys(iterationData).length > 0 ? iterationData : undefined,
              response,
              success: response.status >= 200 && response.status < 400,
              timestamp: Date.now(),
            }

            results.push(requestResult)

            if (requestResult.success) {
              successfulRequests++
            } else {
              failedRequests++

              // Stop on error if configured
              if (config.stopOnError) {
                this.shouldStop = true
                break
              }
            }

            // Call progress callback
            if (onProgress) {
              onProgress(requestResult)
            }

            // Delay between requests
            if (config.delay > 0) {
              await this.sleep(config.delay)
            }
          } catch (error: any) {
            failedRequests++

            const requestResult: RequestRunResult = {
              requestId: request.id,
              requestName: request.name,
              iteration: iteration + 1,
              dataRow: Object.keys(iterationData).length > 0 ? iterationData : undefined,
              response: {
                status: 0,
                statusText: 'Error',
                headers: {},
                data: error,
                time: 0,
                size: 0,
              },
              success: false,
              error: error.message || 'Unknown error',
              timestamp: Date.now(),
            }

            results.push(requestResult)

            // Call progress callback
            if (onProgress) {
              onProgress(requestResult)
            }

            // Stop on error if configured
            if (config.stopOnError) {
              this.shouldStop = true
              break
            }

            // Delay between requests
            if (config.delay > 0) {
              await this.sleep(config.delay)
            }
          }
        }

        if (this.shouldStop) {
          break
        }
      }

      const endTime = Date.now()

      return {
        collectionId: collection.id,
        collectionName: collection.name,
        startTime,
        endTime,
        totalRequests: results.length,
        successfulRequests,
        failedRequests,
        iterations,
        results,
      }
    } finally {
      this.isRunning = false
      this.shouldStop = false
    }
  }

  /**
   * Stop the current collection run
   */
  stop() {
    this.shouldStop = true
  }

  /**
   * Check if collection runner is running
   */
  isCollectionRunning(): boolean {
    return this.isRunning
  }

  /**
   * Get all requests from collection based on selection
   */
  private getRequestsToRun(collection: Collection, config: CollectionRunConfig): Request[] {
    const requests: Request[] = []

    // If specific requests selected, use those
    if (config.selectedRequests && config.selectedRequests.length > 0) {
      // Get all requests including from folders
      const allRequests = this.getAllRequests(collection)
      return allRequests.filter(r => config.selectedRequests!.includes(r.id))
    }

    // If specific folders selected, use those
    if (config.selectedFolders && config.selectedFolders.length > 0) {
      config.selectedFolders.forEach(folderId => {
        const folder = this.findFolder(collection.folders, folderId)
        if (folder) {
          requests.push(...this.getRequestsFromFolder(folder))
        }
      })
      return requests
    }

    // Otherwise, run all requests
    return this.getAllRequests(collection)
  }

  /**
   * Get all requests from collection (including nested folders)
   */
  private getAllRequests(collection: Collection): Request[] {
    const requests: Request[] = [...collection.requests]

    collection.folders.forEach(folder => {
      requests.push(...this.getRequestsFromFolder(folder))
    })

    return requests
  }

  /**
   * Get all requests from a folder (including nested folders)
   */
  private getRequestsFromFolder(folder: Folder): Request[] {
    const requests: Request[] = [...folder.requests]

    folder.folders.forEach(subFolder => {
      requests.push(...this.getRequestsFromFolder(subFolder))
    })

    return requests
  }

  /**
   * Find a folder by ID (recursive)
   */
  private findFolder(folders: Folder[], folderId: string): Folder | null {
    for (const folder of folders) {
      if (folder.id === folderId) {
        return folder
      }

      const found = this.findFolder(folder.folders, folderId)
      if (found) {
        return found
      }
    }

    return null
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Parse CSV data file
   */
  static parseCSV(csvText: string): Record<string, any>[] {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const data: Record<string, any>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, any> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      data.push(row)
    }

    return data
  }

  /**
   * Parse JSON data file
   */
  static parseJSON(jsonText: string): Record<string, any>[] {
    try {
      const parsed = JSON.parse(jsonText)

      // If it's already an array, return it
      if (Array.isArray(parsed)) {
        return parsed
      }

      // If it's a single object, wrap it in an array
      return [parsed]
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }
}

export const collectionRunner = CollectionRunner.getInstance()
