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
  createdAt: number
  updatedAt: number
}

export interface Response {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
}

export interface Collection {
  id: string
  name: string
  description?: string
  requests: Request[]
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
