import { Request } from '../types'

export class CodeGenerator {
  static generateCurl(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let cmd = 'curl'

    // Method
    if (method !== 'GET') {
      cmd += ` -X ${method}`
    }

    // URL with params
    let fullUrl = url
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
    cmd += ` "${fullUrl}"`

    // Headers
    const allHeaders = [...headers]

    // Add auth headers
    if (auth.type === 'bearer' && auth.bearer?.token) {
      allHeaders.push({
        id: 'auth',
        key: 'Authorization',
        value: `Bearer ${auth.bearer.token}`,
        enabled: true,
      })
    } else if (auth.type === 'basic' && auth.basic?.username && auth.basic?.password) {
      const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`)
      allHeaders.push({
        id: 'auth',
        key: 'Authorization',
        value: `Basic ${credentials}`,
        enabled: true,
      })
    } else if (auth.type === 'api-key' && auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.in === 'header') {
      allHeaders.push({
        id: 'auth',
        key: auth.apiKey.key,
        value: auth.apiKey.value,
        enabled: true,
      })
    }

    allHeaders
      .filter((h) => h.enabled && h.key)
      .forEach((h) => {
        cmd += ` \\\n  -H "${h.key}: ${h.value}"`
      })

    // Body
    if (body && body.type !== 'none' && body.content) {
      if (body.type === 'json') {
        cmd += ` \\\n  -H "Content-Type: application/json"`
        cmd += ` \\\n  -d '${body.content}'`
      } else {
        cmd += ` \\\n  -d '${body.content}'`
      }
    }

    return cmd
  }

  static generatePython(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'import requests\nimport json\n\n'

    // URL
    code += `url = "${url}"\n\n`

    // Params
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      code += 'params = {\n'
      activeParams.forEach((p) => {
        code += `    "${p.key}": "${p.value}",\n`
      })
      code += '}\n\n'
    }

    // Headers
    const allHeaders = [...headers.filter((h) => h.enabled && h.key)]
    if (allHeaders.length > 0 || auth.type !== 'none') {
      code += 'headers = {\n'
      allHeaders.forEach((h) => {
        code += `    "${h.key}": "${h.value}",\n`
      })

      if (auth.type === 'bearer' && auth.bearer?.token) {
        code += `    "Authorization": "Bearer ${auth.bearer.token}",\n`
      } else if (auth.type === 'api-key' && auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.in === 'header') {
        code += `    "${auth.apiKey.key}": "${auth.apiKey.value}",\n`
      }

      code += '}\n\n'
    }

    // Body
    if (body && body.type !== 'none' && body.content) {
      if (body.type === 'json') {
        code += `data = json.loads('''${body.content}''')\n\n`
      } else {
        code += `data = '''${body.content}'''\n\n`
      }
    }

    // Auth
    let authParam = ''
    if (auth.type === 'basic' && auth.basic?.username && auth.basic?.password) {
      authParam = `, auth=("${auth.basic.username}", "${auth.basic.password}")`
    }

    // Request
    code += `response = requests.${method.toLowerCase()}(url`
    if (activeParams.length > 0) code += ', params=params'
    if (allHeaders.length > 0 || auth.type === 'bearer' || (auth.type === 'api-key' && auth.apiKey?.in === 'header')) {
      code += ', headers=headers'
    }
    if (body && body.type !== 'none' && body.content) {
      code += body.type === 'json' ? ', json=data' : ', data=data'
    }
    code += authParam
    code += ')\n\n'

    code += 'print(f"Status: {response.status_code}")\n'
    code += 'print(f"Response: {response.text}")\n'

    return code
  }

  static generateJavaScript(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = '// Using Fetch API\n\n'

    // URL with params
    let fullUrl = url
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
    code += `const url = "${fullUrl}";\n\n`

    // Options
    code += 'const options = {\n'
    code += `  method: "${method}",\n`

    // Headers
    const allHeaders = [...headers.filter((h) => h.enabled && h.key)]
    if (allHeaders.length > 0 || auth.type !== 'none' || (body && body.type !== 'none')) {
      code += '  headers: {\n'

      allHeaders.forEach((h) => {
        code += `    "${h.key}": "${h.value}",\n`
      })

      if (auth.type === 'bearer' && auth.bearer?.token) {
        code += `    "Authorization": "Bearer ${auth.bearer.token}",\n`
      } else if (auth.type === 'api-key' && auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.in === 'header') {
        code += `    "${auth.apiKey.key}": "${auth.apiKey.value}",\n`
      }

      if (body && body.type === 'json') {
        code += '    "Content-Type": "application/json",\n'
      }

      code += '  },\n'
    }

    // Body
    if (body && body.type !== 'none' && body.content) {
      if (body.type === 'json') {
        code += `  body: JSON.stringify(${body.content}),\n`
      } else {
        code += `  body: "${body.content.replace(/"/g, '\\"')}",\n`
      }
    }

    code += '};\n\n'

    code += 'fetch(url, options)\n'
    code += '  .then(response => response.json())\n'
    code += '  .then(data => console.log(data))\n'
    code += '  .catch(error => console.error("Error:", error));\n'

    return code
  }

  static generateNodeAxios(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'const axios = require("axios");\n\n'

    // Config
    code += 'const config = {\n'
    code += `  method: "${method.toLowerCase()}",\n`
    code += `  url: "${url}",\n`

    // Params
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      code += '  params: {\n'
      activeParams.forEach((p) => {
        code += `    "${p.key}": "${p.value}",\n`
      })
      code += '  },\n'
    }

    // Headers
    const allHeaders = [...headers.filter((h) => h.enabled && h.key)]
    if (allHeaders.length > 0 || auth.type !== 'none') {
      code += '  headers: {\n'
      allHeaders.forEach((h) => {
        code += `    "${h.key}": "${h.value}",\n`
      })

      if (auth.type === 'bearer' && auth.bearer?.token) {
        code += `    "Authorization": "Bearer ${auth.bearer.token}",\n`
      } else if (auth.type === 'api-key' && auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.in === 'header') {
        code += `    "${auth.apiKey.key}": "${auth.apiKey.value}",\n`
      }

      code += '  },\n'
    }

    // Body
    if (body && body.type !== 'none' && body.content) {
      if (body.type === 'json') {
        code += `  data: ${body.content},\n`
      } else {
        code += `  data: "${body.content.replace(/"/g, '\\"')}",\n`
      }
    }

    code += '};\n\n'

    code += 'axios(config)\n'
    code += '  .then(response => {\n'
    code += '    console.log(JSON.stringify(response.data));\n'
    code += '  })\n'
    code += '  .catch(error => {\n'
    code += '    console.log(error);\n'
    code += '  });\n'

    return code
  }

  static generateGo(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'package main\n\n'
    code += 'import (\n'
    code += '\t"fmt"\n'
    code += '\t"io"\n'
    code += '\t"net/http"\n'
    if (body && body.type === 'json') {
      code += '\t"strings"\n'
    }
    code += ')\n\n'

    code += 'func main() {\n'

    // URL with params
    let fullUrl = url
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }
    code += `\turl := "${fullUrl}"\n\n`

    // Body
    if (body && body.type !== 'none' && body.content) {
      code += `\tpayload := strings.NewReader(\`${body.content}\`)\n\n`
      code += '\treq, _ := http.NewRequest("' + method + '", url, payload)\n\n'
    } else {
      code += '\treq, _ := http.NewRequest("' + method + '", url, nil)\n\n'
    }

    // Headers
    const allHeaders = [...headers.filter((h) => h.enabled && h.key)]
    allHeaders.forEach((h) => {
      code += `\treq.Header.Add("${h.key}", "${h.value}")\n`
    })

    if (auth.type === 'bearer' && auth.bearer?.token) {
      code += `\treq.Header.Add("Authorization", "Bearer ${auth.bearer.token}")\n`
    } else if (auth.type === 'api-key' && auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.in === 'header') {
      code += `\treq.Header.Add("${auth.apiKey.key}", "${auth.apiKey.value}")\n`
    }

    code += '\n\tres, _ := http.DefaultClient.Do(req)\n'
    code += '\tdefer res.Body.Close()\n'
    code += '\tbody, _ := io.ReadAll(res.Body)\n\n'
    code += '\tfmt.Println(string(body))\n'
    code += '}\n'

    return code
  }
}
