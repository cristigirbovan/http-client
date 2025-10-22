import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Request, Response, AuthConfig, KeyValue } from '../types'
import { replaceVariables } from './utils'
import { JavaScriptService, ScriptResponse } from './java-script-service'

export class HttpClient {
  private static instance: HttpClient

  private constructor() {}

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }

  async sendRequest(
    request: Request,
    environmentVariables: Record<string, string> = {}
  ): Promise<Response> {
    const startTime = performance.now()
    let preRequestScriptResult: ScriptResponse | undefined
    let testScriptResult: ScriptResponse | undefined

    // Mutable copy of environment variables (scripts can modify these)
    const mutableEnv = { ...environmentVariables }

    try {
      // Execute pre-request script if present
      if (request.preRequestScript && request.preRequestScript.trim()) {
        try {
          const scriptContext = {
            request: {
              url: request.url,
              method: request.method,
              headers: Object.fromEntries(
                request.headers.filter(h => h.enabled && h.key).map(h => [h.key, h.value])
              ),
              body: request.body?.content,
            },
            environment: mutableEnv,
          }

          preRequestScriptResult = await JavaScriptService.executePreRequestScript(
            request.preRequestScript,
            scriptContext
          )

          // Apply variable updates from script
          if (preRequestScriptResult.success && preRequestScriptResult.updatedVariables) {
            Object.entries(preRequestScriptResult.updatedVariables).forEach(([key, value]) => {
              if (key.startsWith('environment.')) {
                const varName = key.substring('environment.'.length)
                mutableEnv[varName] = String(value)
              }
            })
          }

          // Log script execution
          console.log('[Pre-request Script] Executed:', preRequestScriptResult)
        } catch (error) {
          console.error('[Pre-request Script] Failed:', error)
          // Continue with request even if script fails
        }
      }

      // Replace variables in URL (using potentially updated variables)
      const url = replaceVariables(request.url, mutableEnv)

      // Build headers
      const headers: Record<string, string> = {}
      request.headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headers[h.key] = replaceVariables(h.value, mutableEnv)
        })

      // Apply authentication
      this.applyAuth(headers, request.auth, mutableEnv)

      // Build query params
      const params: Record<string, string> = {}
      request.params
        .filter((p) => p.enabled && p.key)
        .forEach((p) => {
          params[p.key] = replaceVariables(p.value, mutableEnv)
        })

      // Build request body
      let data: any = undefined
      if (request.body && request.body.type !== 'none') {
        data = this.buildRequestBody(request.body, mutableEnv)

        // Set content-type if not already set
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = this.getContentType(request.body.type)
        }
      }

      // Configure axios request with per-request settings
      const config: AxiosRequestConfig = {
        method: request.method,
        url,
        headers,
        params,
        data,
        validateStatus: () => true, // Accept all status codes
        maxRedirects: request.settings?.maxRedirects ?? 5,
        timeout: request.settings?.timeout ?? 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }

      // Apply request-specific settings
      if (request.settings) {
        if (request.settings.followRedirects === false) {
          config.maxRedirects = 0
        }
        if (request.settings.validateSSL === false) {
          // Note: In browser/Electron, this requires additional configuration
          config.httpsAgent = undefined
        }
      }

      const axiosResponse: AxiosResponse = await axios(config)
      const endTime = performance.now()

      // Build initial response
      const response: Response = {
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers as Record<string, string>,
        data: axiosResponse.data,
        time: endTime - startTime,
        size: this.calculateSize(axiosResponse),
      }

      // Execute test script if present
      if (request.testScript && request.testScript.trim()) {
        try {
          const scriptContext = {
            request: {
              url: url,
              method: request.method,
              headers: headers,
              body: data,
            },
            response: {
              statusCode: response.status,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              body: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
              responseTime: response.time,
              responseSize: response.size,
            },
            environment: mutableEnv,
          }

          testScriptResult = await JavaScriptService.executeTestScript(
            request.testScript,
            scriptContext
          )

          // Apply variable updates from test script
          if (testScriptResult.success && testScriptResult.updatedVariables) {
            Object.entries(testScriptResult.updatedVariables).forEach(([key, value]) => {
              if (key.startsWith('environment.')) {
                const varName = key.substring('environment.'.length)
                mutableEnv[varName] = String(value)
              }
            })
          }

          // Log test results
          console.log('[Test Script] Executed:', testScriptResult)
        } catch (error) {
          console.error('[Test Script] Failed:', error)
        }
      }

      // Add script results to response
      if (preRequestScriptResult) {
        response.preRequestScriptResult = {
          success: preRequestScriptResult.success,
          error: preRequestScriptResult.error,
          consoleOutput: preRequestScriptResult.consoleOutput,
          executionTime: preRequestScriptResult.executionTime,
        }
      }

      if (testScriptResult) {
        response.testScriptResult = {
          success: testScriptResult.success,
          error: testScriptResult.error,
          consoleOutput: testScriptResult.consoleOutput,
          testResults: testScriptResult.testResults,
          executionTime: testScriptResult.executionTime,
        }
      }

      return response
    } catch (error: any) {
      const endTime = performance.now()

      // Handle network errors
      throw {
        status: 0,
        statusText: error.message || 'Network Error',
        headers: {},
        data: {
          error: error.message,
          code: error.code,
        },
        time: endTime - startTime,
        size: 0,
      }
    }
  }

  private applyAuth(
    headers: Record<string, string>,
    auth: AuthConfig,
    env: Record<string, string>
  ): void {
    switch (auth.type) {
      case 'bearer':
        if (auth.bearer?.token) {
          headers['Authorization'] = `Bearer ${replaceVariables(auth.bearer.token, env)}`
        }
        break
      case 'basic':
        if (auth.basic?.username && auth.basic?.password) {
          const credentials = btoa(
            `${replaceVariables(auth.basic.username, env)}:${replaceVariables(auth.basic.password, env)}`
          )
          headers['Authorization'] = `Basic ${credentials}`
        }
        break
      case 'api-key':
        if (auth.apiKey?.key && auth.apiKey?.value) {
          const key = replaceVariables(auth.apiKey.key, env)
          const value = replaceVariables(auth.apiKey.value, env)
          if (auth.apiKey.in === 'header') {
            headers[key] = value
          }
        }
        break
      case 'oauth2':
        if (auth.oauth2?.accessToken) {
          const tokenType = auth.oauth2.tokenType || 'Bearer'
          headers['Authorization'] = `${tokenType} ${replaceVariables(auth.oauth2.accessToken, env)}`
        }
        break
    }
  }

  private buildRequestBody(
    body: Request['body'],
    env: Record<string, string>
  ): any {
    if (!body) return undefined

    switch (body.type) {
      case 'json':
        try {
          const jsonStr = replaceVariables(body.content, env)
          return JSON.parse(jsonStr)
        } catch {
          return body.content
        }
      case 'form-data':
        const formData = new FormData()
        body.formData?.forEach((item) => {
          if (item.enabled && item.key) {
            formData.append(item.key, replaceVariables(item.value, env))
          }
        })
        return formData
      case 'x-www-form-urlencoded':
        const params = new URLSearchParams()
        body.formData?.forEach((item) => {
          if (item.enabled && item.key) {
            params.append(item.key, replaceVariables(item.value, env))
          }
        })
        return params.toString()
      default:
        return replaceVariables(body.content, env)
    }
  }

  private getContentType(bodyType: string): string {
    switch (bodyType) {
      case 'json':
        return 'application/json'
      case 'xml':
        return 'application/xml'
      case 'form-data':
        return 'multipart/form-data'
      case 'x-www-form-urlencoded':
        return 'application/x-www-form-urlencoded'
      default:
        return 'text/plain'
    }
  }

  private calculateSize(response: AxiosResponse): number {
    try {
      const dataString = JSON.stringify(response.data)
      return new Blob([dataString]).size
    } catch {
      return 0
    }
  }
}

export const httpClient = HttpClient.getInstance()
