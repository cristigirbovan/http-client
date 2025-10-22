import { Collection, Request, Folder, Environment, KeyValue, AuthConfig } from '../types'
import { v4 as uuidv4 } from 'uuid'

/**
 * Postman Collection v2.1 format interfaces
 */
interface PostmanCollection {
  info: {
    name: string
    description?: string
    schema: string
  }
  item: PostmanItem[]
  variable?: PostmanVariable[]
  auth?: PostmanAuth
}

interface PostmanItem {
  name: string
  description?: string
  item?: PostmanItem[] // Nested folders
  request?: PostmanRequest
  event?: PostmanEvent[]
}

interface PostmanRequest {
  method: string
  header?: PostmanHeader[]
  url: string | PostmanUrl
  body?: PostmanBody
  auth?: PostmanAuth
  description?: string
}

interface PostmanUrl {
  raw: string
  protocol?: string
  host?: string[]
  path?: string[]
  query?: PostmanQuery[]
  variable?: PostmanVariable[]
}

interface PostmanHeader {
  key: string
  value: string
  disabled?: boolean
  description?: string
}

interface PostmanQuery {
  key: string
  value: string
  disabled?: boolean
  description?: string
}

interface PostmanVariable {
  key: string
  value: string | number
  type?: string
  disabled?: boolean
  description?: string
}

interface PostmanBody {
  mode: string
  raw?: string
  urlencoded?: Array<{ key: string; value: string; disabled?: boolean }>
  formdata?: Array<{ key: string; value: string; type?: string; disabled?: boolean }>
}

interface PostmanAuth {
  type: string
  bearer?: Array<{ key: string; value: string }>
  basic?: Array<{ key: string; value: string }>
  apikey?: Array<{ key: string; value: string }>
  oauth2?: Array<{ key: string; value: string }>
}

interface PostmanEvent {
  listen: 'prerequest' | 'test'
  script: {
    type: string
    exec: string[]
  }
}

interface PostmanEnvironment {
  name: string
  values: Array<{
    key: string
    value: string
    enabled: boolean
  }>
}

/**
 * Import Postman Collection v2.1
 */
export class PostmanImporter {
  /**
   * Import Postman collection JSON to ClaraCore format
   */
  static importCollection(postmanJson: string): Collection {
    const postmanCollection: PostmanCollection = JSON.parse(postmanJson)

    // Validate schema
    if (!postmanCollection.info?.schema?.includes('v2.1')) {
      throw new Error('Only Postman Collection v2.1 format is supported')
    }

    const collection: Collection = {
      id: uuidv4(),
      name: postmanCollection.info.name,
      description: postmanCollection.info.description,
      requests: [],
      folders: [],
      variables: this.convertVariables(postmanCollection.variable || []),
      auth: this.convertAuth(postmanCollection.auth),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Convert items (requests and folders)
    if (postmanCollection.item) {
      postmanCollection.item.forEach(item => {
        if (item.request) {
          // It's a request
          collection.requests.push(this.convertRequest(item))
        } else if (item.item) {
          // It's a folder
          collection.folders.push(this.convertFolder(item))
        }
      })
    }

    return collection
  }

  /**
   * Convert Postman folder to ClaraCore folder
   */
  private static convertFolder(postmanItem: PostmanItem): Folder {
    const folder: Folder = {
      id: uuidv4(),
      name: postmanItem.name,
      description: postmanItem.description,
      requests: [],
      folders: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Convert nested items
    if (postmanItem.item) {
      postmanItem.item.forEach(item => {
        if (item.request) {
          folder.requests.push(this.convertRequest(item))
        } else if (item.item) {
          folder.folders.push(this.convertFolder(item))
        }
      })
    }

    // Extract scripts from events
    if (postmanItem.event) {
      postmanItem.event.forEach(event => {
        if (event.listen === 'prerequest') {
          folder.preRequestScript = this.convertScript(event.script.exec)
        } else if (event.listen === 'test') {
          folder.testScript = this.convertScript(event.script.exec)
        }
      })
    }

    return folder
  }

  /**
   * Convert Postman request to ClaraCore request
   */
  private static convertRequest(postmanItem: PostmanItem): Request {
    const postmanRequest = postmanItem.request!

    const request: Request = {
      id: uuidv4(),
      name: postmanItem.name,
      method: postmanRequest.method as any,
      url: this.convertUrl(postmanRequest.url),
      headers: this.convertHeaders(postmanRequest.header || []),
      params: this.convertQueryParams(postmanRequest.url),
      body: this.convertBody(postmanRequest.body),
      auth: this.convertAuth(postmanRequest.auth) || { type: 'none' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Extract scripts from events
    if (postmanItem.event) {
      postmanItem.event.forEach(event => {
        if (event.listen === 'prerequest') {
          request.preRequestScript = this.convertScript(event.script.exec)
        } else if (event.listen === 'test') {
          request.testScript = this.convertScript(event.script.exec)
        }
      })
    }

    return request
  }

  /**
   * Convert Postman URL to string
   */
  private static convertUrl(url: string | PostmanUrl): string {
    if (typeof url === 'string') {
      return url
    }

    return url.raw || ''
  }

  /**
   * Convert Postman headers to ClaraCore format
   */
  private static convertHeaders(headers: PostmanHeader[]): KeyValue[] {
    return headers.map(h => ({
      id: uuidv4(),
      key: h.key,
      value: h.value,
      enabled: !h.disabled,
      description: h.description,
    }))
  }

  /**
   * Convert Postman query params to ClaraCore format
   */
  private static convertQueryParams(url: string | PostmanUrl): KeyValue[] {
    if (typeof url === 'string') {
      return []
    }

    if (!url.query) {
      return []
    }

    return url.query.map(q => ({
      id: uuidv4(),
      key: q.key,
      value: q.value,
      enabled: !q.disabled,
      description: q.description,
    }))
  }

  /**
   * Convert Postman body to ClaraCore format
   */
  private static convertBody(body?: PostmanBody): Request['body'] {
    if (!body) {
      return { type: 'none', content: '' }
    }

    switch (body.mode) {
      case 'raw':
        return {
          type: 'json', // Assume JSON for raw
          content: body.raw || '',
        }

      case 'urlencoded':
        return {
          type: 'x-www-form-urlencoded',
          content: '',
          formData: body.urlencoded?.map(item => ({
            id: uuidv4(),
            key: item.key,
            value: item.value,
            enabled: !item.disabled,
          })),
        }

      case 'formdata':
        return {
          type: 'form-data',
          content: '',
          formData: body.formdata?.map(item => ({
            id: uuidv4(),
            key: item.key,
            value: item.value,
            enabled: !item.disabled,
          })),
        }

      default:
        return { type: 'none', content: '' }
    }
  }

  /**
   * Convert Postman auth to ClaraCore format
   */
  private static convertAuth(auth?: PostmanAuth): AuthConfig | undefined {
    if (!auth) {
      return undefined
    }

    switch (auth.type) {
      case 'bearer':
        const bearerToken = auth.bearer?.find(item => item.key === 'token')?.value || ''
        return {
          type: 'bearer',
          bearer: { token: bearerToken },
        }

      case 'basic':
        const username = auth.basic?.find(item => item.key === 'username')?.value || ''
        const password = auth.basic?.find(item => item.key === 'password')?.value || ''
        return {
          type: 'basic',
          basic: { username, password },
        }

      case 'apikey':
        const key = auth.apikey?.find(item => item.key === 'key')?.value || ''
        const value = auth.apikey?.find(item => item.key === 'value')?.value || ''
        const inValue = auth.apikey?.find(item => item.key === 'in')?.value || 'header'
        return {
          type: 'api-key',
          apiKey: {
            key,
            value,
            in: inValue as 'header' | 'query',
          },
        }

      case 'oauth2':
        const accessToken = auth.oauth2?.find(item => item.key === 'accessToken')?.value || ''
        const tokenType = auth.oauth2?.find(item => item.key === 'tokenType')?.value || 'Bearer'
        return {
          type: 'oauth2',
          oauth2: { accessToken, tokenType },
        }

      default:
        return { type: 'none' }
    }
  }

  /**
   * Convert Postman variables to ClaraCore format
   */
  private static convertVariables(variables: PostmanVariable[]): KeyValue[] {
    return variables.map(v => ({
      id: uuidv4(),
      key: v.key,
      value: String(v.value),
      enabled: !v.disabled,
      description: v.description,
    }))
  }

  /**
   * Convert Postman script (JavaScript) to ClaraCore (Java)
   * Note: This is a basic conversion - users will need to manually convert complex scripts
   */
  private static convertScript(scriptLines: string[]): string {
    const jsScript = scriptLines.join('\n')

    // Add a comment explaining the conversion needed
    const javaComment = `// WARNING: This script was auto-converted from JavaScript (Postman)
// Please review and update to valid Java syntax

// Original JavaScript:
${jsScript.split('\n').map(line => '// ' + line).join('\n')}

// Java equivalent (TODO: Update this):
`

    // Basic conversions (very limited)
    let javaScript = jsScript
      .replace(/pm\.environment\.set/g, 'pm.setEnvironmentVariable')
      .replace(/pm\.environment\.get/g, 'pm.getEnvironmentVariable')
      .replace(/pm\.test/g, 'test.assertTrue')
      .replace(/pm\.response\.to\.have\.status\((\d+)\)/g, 'test.assertStatusCode("Status code", $1, statusCode)')
      .replace(/console\.log/g, 'console.log')

    return javaComment + javaScript
  }

  /**
   * Import Postman environment JSON
   */
  static importEnvironment(envJson: string): Environment {
    const postmanEnv: PostmanEnvironment = JSON.parse(envJson)

    return {
      id: uuidv4(),
      name: postmanEnv.name,
      variables: postmanEnv.values.map(v => ({
        id: uuidv4(),
        key: v.key,
        value: v.value,
        enabled: v.enabled,
      })),
      isActive: false,
    }
  }
}

/**
 * Export ClaraCore collection to Postman v2.1 format
 */
export class PostmanExporter {
  /**
   * Export ClaraCore collection to Postman v2.1 JSON
   */
  static exportCollection(collection: Collection): string {
    const postmanCollection: PostmanCollection = {
      info: {
        name: collection.name,
        description: collection.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
      variable: this.convertVariables(collection.variables),
      auth: this.convertAuth(collection.auth),
    }

    // Convert requests
    collection.requests.forEach(request => {
      postmanCollection.item.push(this.convertRequest(request))
    })

    // Convert folders
    collection.folders.forEach(folder => {
      postmanCollection.item.push(this.convertFolder(folder))
    })

    return JSON.stringify(postmanCollection, null, 2)
  }

  /**
   * Convert ClaraCore folder to Postman format
   */
  private static convertFolder(folder: Folder): PostmanItem {
    const item: PostmanItem = {
      name: folder.name,
      description: folder.description,
      item: [],
    }

    // Convert requests
    folder.requests.forEach(request => {
      item.item!.push(this.convertRequest(request))
    })

    // Convert nested folders
    folder.folders.forEach(subFolder => {
      item.item!.push(this.convertFolder(subFolder))
    })

    // Add scripts as events
    const events: PostmanEvent[] = []
    if (folder.preRequestScript) {
      events.push({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: folder.preRequestScript.split('\n'),
        },
      })
    }
    if (folder.testScript) {
      events.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: folder.testScript.split('\n'),
        },
      })
    }
    if (events.length > 0) {
      item.event = events
    }

    return item
  }

  /**
   * Convert ClaraCore request to Postman format
   */
  private static convertRequest(request: Request): PostmanItem {
    const item: PostmanItem = {
      name: request.name,
      request: {
        method: request.method,
        header: this.convertHeaders(request.headers),
        url: this.convertUrl(request.url, request.params),
        body: this.convertBody(request.body),
        auth: this.convertAuth(request.auth),
      },
    }

    // Add scripts as events
    const events: PostmanEvent[] = []
    if (request.preRequestScript) {
      events.push({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: request.preRequestScript.split('\n'),
        },
      })
    }
    if (request.testScript) {
      events.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: request.testScript.split('\n'),
        },
      })
    }
    if (events.length > 0) {
      item.event = events
    }

    return item
  }

  /**
   * Convert URL and params to Postman format
   */
  private static convertUrl(url: string, params: KeyValue[]): PostmanUrl {
    // Add query params to URL if present
    let fullUrl = url
    const enabledParams = params.filter(p => p.enabled && p.key)

    if (enabledParams.length > 0) {
      const queryString = enabledParams.map(p => `${p.key}=${p.value}`).join('&')
      fullUrl = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`
    }

    return {
      raw: fullUrl,
      query: params.map(p => ({
        key: p.key,
        value: p.value,
        disabled: !p.enabled,
        description: p.description,
      })),
    }
  }

  /**
   * Convert headers to Postman format
   */
  private static convertHeaders(headers: KeyValue[]): PostmanHeader[] {
    return headers.map(h => ({
      key: h.key,
      value: h.value,
      disabled: !h.enabled,
      description: h.description,
    }))
  }

  /**
   * Convert body to Postman format
   */
  private static convertBody(body?: Request['body']): PostmanBody | undefined {
    if (!body || body.type === 'none') {
      return undefined
    }

    switch (body.type) {
      case 'json':
      case 'xml':
      case 'raw':
        return {
          mode: 'raw',
          raw: body.content,
        }

      case 'x-www-form-urlencoded':
        return {
          mode: 'urlencoded',
          urlencoded: body.formData?.map(item => ({
            key: item.key,
            value: item.value,
            disabled: !item.enabled,
          })),
        }

      case 'form-data':
        return {
          mode: 'formdata',
          formdata: body.formData?.map(item => ({
            key: item.key,
            value: item.value,
            disabled: !item.enabled,
          })),
        }

      default:
        return undefined
    }
  }

  /**
   * Convert auth to Postman format
   */
  private static convertAuth(auth?: AuthConfig): PostmanAuth | undefined {
    if (!auth || auth.type === 'none') {
      return undefined
    }

    switch (auth.type) {
      case 'bearer':
        return {
          type: 'bearer',
          bearer: [{ key: 'token', value: auth.bearer?.token || '' }],
        }

      case 'basic':
        return {
          type: 'basic',
          basic: [
            { key: 'username', value: auth.basic?.username || '' },
            { key: 'password', value: auth.basic?.password || '' },
          ],
        }

      case 'api-key':
        return {
          type: 'apikey',
          apikey: [
            { key: 'key', value: auth.apiKey?.key || '' },
            { key: 'value', value: auth.apiKey?.value || '' },
            { key: 'in', value: auth.apiKey?.in || 'header' },
          ],
        }

      case 'oauth2':
        return {
          type: 'oauth2',
          oauth2: [
            { key: 'accessToken', value: auth.oauth2?.accessToken || '' },
            { key: 'tokenType', value: auth.oauth2?.tokenType || 'Bearer' },
          ],
        }

      default:
        return undefined
    }
  }

  /**
   * Convert variables to Postman format
   */
  private static convertVariables(variables: KeyValue[]): PostmanVariable[] {
    return variables.map(v => ({
      key: v.key,
      value: v.value,
      disabled: !v.enabled,
      description: v.description,
    }))
  }

  /**
   * Export environment to Postman format
   */
  static exportEnvironment(environment: Environment): string {
    const postmanEnv: PostmanEnvironment = {
      name: environment.name,
      values: environment.variables.map(v => ({
        key: v.key,
        value: v.value,
        enabled: v.enabled,
      })),
    }

    return JSON.stringify(postmanEnv, null, 2)
  }
}
