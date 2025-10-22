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

  // ========== JAVA GENERATORS ==========

  static generateRestTemplate(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'import org.springframework.http.*;\n'
    code += 'import org.springframework.web.client.RestTemplate;\n'
    if (body && body.type === 'json') {
      code += 'import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;\n'
    }
    code += 'import java.util.Arrays;\n\n'

    code += 'public class ApiClient {\n'
    code += '    public static void main(String[] args) {\n'
    code += '        RestTemplate restTemplate = new RestTemplate();\n\n'

    // Headers
    code += '        HttpHeaders headers = new HttpHeaders();\n'
    const allHeaders = [...headers.filter((h) => h.enabled && h.key)]
    allHeaders.forEach((h) => {
      code += `        headers.set("${h.key}", "${h.value}");\n`
    })

    if (body && body.type === 'json') {
      code += '        headers.setContentType(MediaType.APPLICATION_JSON);\n'
    }

    // Auth
    if (auth.type === 'bearer' && auth.bearer?.token) {
      code += `        headers.setBearerAuth("${auth.bearer.token}");\n`
    } else if (auth.type === 'basic' && auth.basic?.username && auth.basic?.password) {
      code += `        headers.setBasicAuth("${auth.basic.username}", "${auth.basic.password}");\n`
    }

    code += '\n'

    // Body
    let bodyVar = 'null'
    if (body && body.type !== 'none' && body.content) {
      code += '        String requestBody = """\n'
      code += `${body.content.split('\n').map(line => '                ' + line).join('\n')}\n`
      code += '                """;\n\n'
      bodyVar = 'requestBody'
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

    // Request
    code += `        HttpEntity<String> entity = new HttpEntity<>(${bodyVar}, headers);\n\n`
    code += `        ResponseEntity<String> response = restTemplate.exchange(\n`
    code += `            "${fullUrl}",\n`
    code += `            HttpMethod.${method},\n`
    code += `            entity,\n`
    code += `            String.class\n`
    code += `        );\n\n`

    code += '        System.out.println("Status: " + response.getStatusCode());\n'
    code += '        System.out.println("Response: " + response.getBody());\n'
    code += '    }\n'
    code += '}\n'

    return code
  }

  static generateWebClient(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'import org.springframework.web.reactive.function.client.WebClient;\n'
    code += 'import reactor.core.publisher.Mono;\n\n'

    code += 'public class ApiClient {\n'
    code += '    public static void main(String[] args) {\n'
    code += '        WebClient client = WebClient.builder()\n'

    // Base URL
    const urlObj = new URL(url)
    code += `            .baseUrl("${urlObj.origin}")\n`

    // Default headers
    if (headers.filter(h => h.enabled && h.key).length > 0 || auth.type !== 'none') {
      code += '            .defaultHeader("Content-Type", "application/json")\n'
    }

    code += '            .build();\n\n'

    // Build request
    code += `        Mono<String> response = client.${method.toLowerCase()}()\n`

    // URL with params
    let path = urlObj.pathname
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      path += (path.includes('?') ? '&' : '?') + queryString
    }
    code += `            .uri("${path}")\n`

    // Headers
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      code += `            .header("${h.key}", "${h.value}")\n`
    })

    // Auth
    if (auth.type === 'bearer' && auth.bearer?.token) {
      code += `            .header("Authorization", "Bearer ${auth.bearer.token}")\n`
    } else if (auth.type === 'basic' && auth.basic?.username && auth.basic?.password) {
      code += `            .headers(h -> h.setBasicAuth("${auth.basic.username}", "${auth.basic.password}"))\n`
    }

    // Body
    if (body && body.type !== 'none' && body.content && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += '            .bodyValue("""\n'
      code += `${body.content.split('\n').map(line => '                    ' + line).join('\n')}\n`
      code += '                    """)\n'
    }

    code += '            .retrieve()\n'
    code += '            .bodyToMono(String.class);\n\n'

    code += '        response.subscribe(\n'
    code += '            data -> System.out.println("Response: " + data),\n'
    code += '            error -> System.err.println("Error: " + error.getMessage())\n'
    code += '        );\n'
    code += '    }\n'
    code += '}\n'

    return code
  }

  static generateFeignClient(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    const urlObj = new URL(url)
    const interfaceName = 'ApiClient'

    let code = 'import org.springframework.cloud.openfeign.FeignClient;\n'
    code += 'import org.springframework.web.bind.annotation.*;\n\n'

    code += `@FeignClient(name = "api-client", url = "${urlObj.origin}")\n`
    code += `public interface ${interfaceName} {\n\n`

    // Build method
    code += '    '

    // Method annotation
    switch (method) {
      case 'GET':
        code += '@GetMapping'
        break
      case 'POST':
        code += '@PostMapping'
        break
      case 'PUT':
        code += '@PutMapping'
        break
      case 'DELETE':
        code += '@DeleteMapping'
        break
      case 'PATCH':
        code += '@PatchMapping'
        break
      default:
        code += `@RequestMapping(method = RequestMethod.${method})`
    }

    code += `("${urlObj.pathname}")\n`

    // Headers
    if (headers.filter(h => h.enabled && h.key).length > 0) {
      code += '    @Headers({\n'
      headers.filter((h) => h.enabled && h.key).forEach((h, index, arr) => {
        code += `        "${h.key}: ${h.value}"${index < arr.length - 1 ? ',' : ''}\n`
      })
      code += '    })\n'
    }

    // Method signature
    code += '    String makeRequest('

    // Parameters
    const methodParams = []

    // Path variables
    const pathVars = urlObj.pathname.match(/\{([^}]+)\}/g)
    if (pathVars) {
      pathVars.forEach(pv => {
        const varName = pv.replace(/[{}]/g, '')
        methodParams.push(`@PathVariable("${varName}") String ${varName}`)
      })
    }

    // Query params
    params.filter((p) => p.enabled && p.key).forEach((p) => {
      methodParams.push(`@RequestParam("${p.key}") String ${p.key}`)
    })

    // Request body
    if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method)) {
      methodParams.push('@RequestBody String body')
    }

    code += methodParams.join(', ')
    code += ');\n'
    code += '}\n'

    return code
  }

  static generateJUnit(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body } = request

    let code = 'import org.junit.jupiter.api.Test;\n'
    code += 'import org.springframework.beans.factory.annotation.Autowired;\n'
    code += 'import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;\n'
    code += 'import org.springframework.boot.test.context.SpringBootTest;\n'
    code += 'import org.springframework.test.web.servlet.MockMvc;\n'
    code += 'import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;\n'
    code += 'import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;\n'
    code += 'import org.springframework.http.MediaType;\n\n'

    code += '@SpringBootTest\n'
    code += '@AutoConfigureMockMvc\n'
    code += 'class ApiTest {\n\n'
    code += '    @Autowired\n'
    code += '    private MockMvc mockMvc;\n\n'

    code += '    @Test\n'
    code += '    void testApiEndpoint() throws Exception {\n'

    // Build request
    const urlObj = new URL(url)
    let path = urlObj.pathname

    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      path += (path.includes('?') ? '&' : '?') + queryString
    }

    code += `        mockMvc.perform(${method.toLowerCase()}("${path}")\n`

    // Headers
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      code += `                .header("${h.key}", "${h.value}")\n`
    })

    // Content type and body
    if (body && body.type === 'json' && body.content) {
      code += '                .contentType(MediaType.APPLICATION_JSON)\n'
      code += '                .content("""\n'
      code += `${body.content.split('\n').map(line => '                        ' + line).join('\n')}\n`
      code += '                        """))\n'
    } else {
      code += ')\n'
    }

    // Assertions
    code += '                .andExpect(status().isOk());\n'

    code += '    }\n'
    code += '}\n'

    return code
  }

  static generateOkHttp(request: Request, env: Record<string, string> = {}): string {
    const { method, url, headers, params, body, auth } = request

    let code = 'import okhttp3.*;\n'
    code += 'import java.io.IOException;\n\n'

    code += 'public class ApiClient {\n'
    code += '    public static void main(String[] args) throws IOException {\n'
    code += '        OkHttpClient client = new OkHttpClient();\n\n'

    // Build URL with params
    let fullUrl = url
    const activeParams = params.filter((p) => p.enabled && p.key)
    if (activeParams.length > 0) {
      const queryString = activeParams
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&')
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
    }

    // Request body
    let requestBody = 'null'
    if (body && body.type !== 'none' && body.content && ['POST', 'PUT', 'PATCH'].includes(method)) {
      code += '        String json = """\n'
      code += `${body.content.split('\n').map(line => '                ' + line).join('\n')}\n`
      code += '                """;\n'
      code += '        RequestBody body = RequestBody.create(\n'
      code += '            json,\n'
      code += '            MediaType.parse("application/json")\n'
      code += '        );\n\n'
      requestBody = 'body'
    }

    // Build request
    code += '        Request request = new Request.Builder()\n'
    code += `            .url("${fullUrl}")\n`
    code += `            .method("${method}", ${requestBody})\n`

    // Headers
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      code += `            .addHeader("${h.key}", "${h.value}")\n`
    })

    // Auth
    if (auth.type === 'bearer' && auth.bearer?.token) {
      code += `            .addHeader("Authorization", "Bearer ${auth.bearer.token}")\n`
    } else if (auth.type === 'basic' && auth.basic?.username && auth.basic?.password) {
      code += `            .header("Authorization", Credentials.basic("${auth.basic.username}", "${auth.basic.password}"))\n`
    }

    code += '            .build();\n\n'

    // Execute
    code += '        try (Response response = client.newCall(request).execute()) {\n'
    code += '            System.out.println("Status: " + response.code());\n'
    code += '            System.out.println("Response: " + response.body().string());\n'
    code += '        }\n'
    code += '    }\n'
    code += '}\n'

    return code
  }
}
