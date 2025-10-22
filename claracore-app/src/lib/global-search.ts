import { Collection, Request, Folder, HistoryEntry, Environment } from '../types'

/**
 * Search result types
 */
export interface SearchResult {
  type: 'request' | 'collection' | 'folder' | 'history' | 'environment'
  id: string
  name: string
  description?: string
  matchedFields: string[]
  relevance: number
  parent?: {
    type: 'collection' | 'folder'
    name: string
    id: string
  }
  data: any // Original item
}

export interface SearchOptions {
  query: string
  types?: Array<'request' | 'collection' | 'folder' | 'history' | 'environment'>
  matchMethod?: 'contains' | 'fuzzy' | 'exact'
  caseSensitive?: boolean
  searchFields?: string[] // ['name', 'url', 'description', etc.]
  limit?: number
}

/**
 * Global Search Engine for ClaraCore
 * Search across collections, requests, history, environments
 */
export class GlobalSearch {
  /**
   * Perform search across all items
   */
  static search(
    collections: Collection[],
    history: HistoryEntry[],
    environments: Environment[],
    options: SearchOptions
  ): SearchResult[] {
    const results: SearchResult[] = []

    const {
      query,
      types = ['request', 'collection', 'folder', 'history', 'environment'],
      matchMethod = 'contains',
      caseSensitive = false,
      searchFields = ['name', 'url', 'description', 'method'],
      limit = 50,
    } = options

    if (!query || query.trim() === '') {
      return []
    }

    const searchQuery = caseSensitive ? query : query.toLowerCase()

    // Search collections
    if (types.includes('collection')) {
      collections.forEach(collection => {
        const collectionResults = this.searchCollection(
          collection,
          searchQuery,
          matchMethod,
          caseSensitive,
          searchFields
        )
        results.push(...collectionResults)
      })
    }

    // Search requests in collections
    if (types.includes('request') || types.includes('folder')) {
      collections.forEach(collection => {
        const requestResults = this.searchRequestsInCollection(
          collection,
          searchQuery,
          matchMethod,
          caseSensitive,
          searchFields,
          types.includes('request'),
          types.includes('folder')
        )
        results.push(...requestResults)
      })
    }

    // Search history
    if (types.includes('history')) {
      history.forEach(entry => {
        const historyResults = this.searchHistoryEntry(
          entry,
          searchQuery,
          matchMethod,
          caseSensitive,
          searchFields
        )
        if (historyResults) {
          results.push(historyResults)
        }
      })
    }

    // Search environments
    if (types.includes('environment')) {
      environments.forEach(env => {
        const envResults = this.searchEnvironment(
          env,
          searchQuery,
          matchMethod,
          caseSensitive,
          searchFields
        )
        if (envResults) {
          results.push(envResults)
        }
      })
    }

    // Sort by relevance (descending)
    results.sort((a, b) => b.relevance - a.relevance)

    // Apply limit
    return results.slice(0, limit)
  }

  /**
   * Search within a collection
   */
  private static searchCollection(
    collection: Collection,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[]
  ): SearchResult[] {
    const results: SearchResult[] = []
    const matchedFields: string[] = []
    let relevance = 0

    // Search name
    if (searchFields.includes('name')) {
      const name = caseSensitive ? collection.name : collection.name.toLowerCase()
      if (this.matches(name, query, matchMethod)) {
        matchedFields.push('name')
        relevance += 10
      }
    }

    // Search description
    if (searchFields.includes('description') && collection.description) {
      const desc = caseSensitive ? collection.description : collection.description.toLowerCase()
      if (this.matches(desc, query, matchMethod)) {
        matchedFields.push('description')
        relevance += 5
      }
    }

    if (matchedFields.length > 0) {
      results.push({
        type: 'collection',
        id: collection.id,
        name: collection.name,
        description: collection.description,
        matchedFields,
        relevance,
        data: collection,
      })
    }

    return results
  }

  /**
   * Search requests within a collection (including folders)
   */
  private static searchRequestsInCollection(
    collection: Collection,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[],
    includeRequests: boolean,
    includeFolders: boolean
  ): SearchResult[] {
    const results: SearchResult[] = []

    // Search root-level requests
    if (includeRequests) {
      collection.requests.forEach(request => {
        const requestResult = this.searchRequest(
          request,
          query,
          matchMethod,
          caseSensitive,
          searchFields,
          {
            type: 'collection',
            name: collection.name,
            id: collection.id,
          }
        )
        if (requestResult) {
          results.push(requestResult)
        }
      })
    }

    // Search folders and requests within folders
    collection.folders.forEach(folder => {
      const folderResults = this.searchFolder(
        folder,
        query,
        matchMethod,
        caseSensitive,
        searchFields,
        {
          type: 'collection',
          name: collection.name,
          id: collection.id,
        },
        includeRequests,
        includeFolders
      )
      results.push(...folderResults)
    })

    return results
  }

  /**
   * Search within a folder (recursive)
   */
  private static searchFolder(
    folder: Folder,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[],
    parent: { type: 'collection' | 'folder'; name: string; id: string },
    includeRequests: boolean,
    includeFolders: boolean
  ): SearchResult[] {
    const results: SearchResult[] = []

    // Search folder itself
    if (includeFolders) {
      const matchedFields: string[] = []
      let relevance = 0

      if (searchFields.includes('name')) {
        const name = caseSensitive ? folder.name : folder.name.toLowerCase()
        if (this.matches(name, query, matchMethod)) {
          matchedFields.push('name')
          relevance += 8
        }
      }

      if (searchFields.includes('description') && folder.description) {
        const desc = caseSensitive ? folder.description : folder.description.toLowerCase()
        if (this.matches(desc, query, matchMethod)) {
          matchedFields.push('description')
          relevance += 4
        }
      }

      if (matchedFields.length > 0) {
        results.push({
          type: 'folder',
          id: folder.id,
          name: folder.name,
          description: folder.description,
          matchedFields,
          relevance,
          parent,
          data: folder,
        })
      }
    }

    // Search requests in this folder
    if (includeRequests) {
      folder.requests.forEach(request => {
        const requestResult = this.searchRequest(
          request,
          query,
          matchMethod,
          caseSensitive,
          searchFields,
          {
            type: 'folder',
            name: folder.name,
            id: folder.id,
          }
        )
        if (requestResult) {
          results.push(requestResult)
        }
      })
    }

    // Search nested folders
    folder.folders.forEach(subFolder => {
      const subResults = this.searchFolder(
        subFolder,
        query,
        matchMethod,
        caseSensitive,
        searchFields,
        {
          type: 'folder',
          name: folder.name,
          id: folder.id,
        },
        includeRequests,
        includeFolders
      )
      results.push(...subResults)
    })

    return results
  }

  /**
   * Search a request
   */
  private static searchRequest(
    request: Request,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[],
    parent?: { type: 'collection' | 'folder'; name: string; id: string }
  ): SearchResult | null {
    const matchedFields: string[] = []
    let relevance = 0

    // Search name
    if (searchFields.includes('name')) {
      const name = caseSensitive ? request.name : request.name.toLowerCase()
      if (this.matches(name, query, matchMethod)) {
        matchedFields.push('name')
        relevance += 10
      }
    }

    // Search URL
    if (searchFields.includes('url')) {
      const url = caseSensitive ? request.url : request.url.toLowerCase()
      if (this.matches(url, query, matchMethod)) {
        matchedFields.push('url')
        relevance += 15 // URL matches are highly relevant
      }
    }

    // Search method
    if (searchFields.includes('method')) {
      const method = caseSensitive ? request.method : request.method.toLowerCase()
      if (this.matches(method, query, matchMethod)) {
        matchedFields.push('method')
        relevance += 5
      }
    }

    // Search headers
    if (searchFields.includes('headers')) {
      request.headers.forEach(header => {
        const key = caseSensitive ? header.key : header.key.toLowerCase()
        const value = caseSensitive ? header.value : header.value.toLowerCase()
        if (this.matches(key, query, matchMethod) || this.matches(value, query, matchMethod)) {
          matchedFields.push('headers')
          relevance += 3
        }
      })
    }

    // Search body
    if (searchFields.includes('body') && request.body?.content) {
      const body = caseSensitive ? request.body.content : request.body.content.toLowerCase()
      if (this.matches(body, query, matchMethod)) {
        matchedFields.push('body')
        relevance += 7
      }
    }

    if (matchedFields.length === 0) {
      return null
    }

    return {
      type: 'request',
      id: request.id,
      name: request.name,
      description: `${request.method} ${request.url}`,
      matchedFields,
      relevance,
      parent,
      data: request,
    }
  }

  /**
   * Search history entry
   */
  private static searchHistoryEntry(
    entry: HistoryEntry,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[]
  ): SearchResult | null {
    const requestResult = this.searchRequest(
      entry.request,
      query,
      matchMethod,
      caseSensitive,
      searchFields
    )

    if (!requestResult) {
      return null
    }

    return {
      ...requestResult,
      type: 'history',
      id: entry.id,
      description: `${entry.request.method} ${entry.request.url} - ${new Date(entry.timestamp).toLocaleString()}`,
    }
  }

  /**
   * Search environment
   */
  private static searchEnvironment(
    env: Environment,
    query: string,
    matchMethod: string,
    caseSensitive: boolean,
    searchFields: string[]
  ): SearchResult | null {
    const matchedFields: string[] = []
    let relevance = 0

    // Search name
    if (searchFields.includes('name')) {
      const name = caseSensitive ? env.name : env.name.toLowerCase()
      if (this.matches(name, query, matchMethod)) {
        matchedFields.push('name')
        relevance += 10
      }
    }

    // Search variables
    env.variables.forEach(variable => {
      const key = caseSensitive ? variable.key : variable.key.toLowerCase()
      const value = caseSensitive ? variable.value : variable.value.toLowerCase()
      if (this.matches(key, query, matchMethod) || this.matches(value, query, matchMethod)) {
        matchedFields.push('variables')
        relevance += 5
      }
    })

    if (matchedFields.length === 0) {
      return null
    }

    return {
      type: 'environment',
      id: env.id,
      name: env.name,
      matchedFields,
      relevance,
      data: env,
    }
  }

  /**
   * Check if text matches query based on match method
   */
  private static matches(text: string, query: string, method: string): boolean {
    switch (method) {
      case 'exact':
        return text === query

      case 'fuzzy':
        return this.fuzzyMatch(text, query)

      case 'contains':
      default:
        return text.includes(query)
    }
  }

  /**
   * Fuzzy matching algorithm
   */
  private static fuzzyMatch(text: string, query: string): boolean {
    let textIndex = 0
    let queryIndex = 0

    while (textIndex < text.length && queryIndex < query.length) {
      if (text[textIndex] === query[queryIndex]) {
        queryIndex++
      }
      textIndex++
    }

    return queryIndex === query.length
  }

  /**
   * Filter results by type
   */
  static filterByType(results: SearchResult[], type: SearchResult['type']): SearchResult[] {
    return results.filter(r => r.type === type)
  }

  /**
   * Get unique types in results
   */
  static getResultTypes(results: SearchResult[]): SearchResult['type'][] {
    const types = new Set<SearchResult['type']>()
    results.forEach(r => types.add(r.type))
    return Array.from(types)
  }

  /**
   * Highlight matched text in result
   */
  static highlightMatches(text: string, query: string, caseSensitive = false): string {
    if (!query) return text

    const searchText = caseSensitive ? text : text.toLowerCase()
    const searchQuery = caseSensitive ? query : query.toLowerCase()

    const index = searchText.indexOf(searchQuery)
    if (index === -1) return text

    const before = text.substring(0, index)
    const match = text.substring(index, index + query.length)
    const after = text.substring(index + query.length)

    return `${before}<mark>${match}</mark>${after}`
  }
}
