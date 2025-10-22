export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2'

export type BodyType = 'none' | 'json' | 'xml' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary'

export interface KeyValue {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

export interface AuthConfig {
  type: AuthType
  bearer?: {
    token: string
  }
  basic?: {
    username: string
    password: string
  }
  apiKey?: {
    key: string
    value: string
    in: 'header' | 'query'
  }
  oauth2?: {
    accessToken: string
    tokenType: string
  }
}

export interface Request {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: KeyValue[]
  params: KeyValue[]
  body?: {
    type: BodyType
    content: string
    formData?: KeyValue[]
  }
  auth: AuthConfig
  preRequestScript?: string
  testScript?: string
  settings?: RequestSettings
  createdAt: number
  updatedAt: number
}

export interface RequestSettings {
  timeout?: number
  followRedirects?: boolean
  maxRedirects?: number
  validateSSL?: boolean
  encoding?: string
}

export interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
  preRequestScriptResult?: ScriptExecutionResult
  testScriptResult?: ScriptExecutionResult
}

export interface ScriptExecutionResult {
  success: boolean
  error?: string
  consoleOutput: string[]
  testResults?: TestResult[]
  executionTime: number
}

export interface TestResult {
  name: string
  passed: boolean
  message: string
}

export interface Folder {
  id: string
  name: string
  description?: string
  requests: Request[]
  folders: Folder[]
  auth?: AuthConfig
  preRequestScript?: string
  testScript?: string
  createdAt: number
  updatedAt: number
}

export interface Collection {
  id: string
  name: string
  description?: string
  requests: Request[]
  folders: Folder[]
  variables: KeyValue[]
  auth?: AuthConfig
  createdAt: number
  updatedAt: number
}

export interface Environment {
  id: string
  name: string
  variables: KeyValue[]
  isActive: boolean
}

export interface HistoryEntry {
  id: string
  request: Request
  response: Response
  timestamp: number
}

export interface Workspace {
  id: string
  name: string
  collections: Collection[]
  environments: Environment[]
  history: HistoryEntry[]
}

export interface CollectionRunConfig {
  collectionId: string
  iterations: number
  delay: number // ms between requests
  dataFile?: DataFile
  stopOnError: boolean
  saveResponses: boolean
  selectedFolders?: string[]
  selectedRequests?: string[]
}

export interface DataFile {
  type: 'json' | 'csv'
  data: Record<string, any>[]
}

export interface CollectionRunResult {
  collectionId: string
  collectionName: string
  startTime: number
  endTime: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  iterations: number
  results: RequestRunResult[]
}

export interface RequestRunResult {
  requestId: string
  requestName: string
  iteration: number
  dataRow?: Record<string, any>
  response: Response
  success: boolean
  error?: string
  timestamp: number
}

export interface DynamicVariable {
  key: string
  generator: () => any
  description: string
}
