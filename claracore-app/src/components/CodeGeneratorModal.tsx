import { useState } from 'react'
import { Button } from './ui/button'
import { Select } from './ui/select'
import { Copy, Check, Code } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { CodeGenerator } from '../lib/code-generator'
import { useRequestStore } from '../store/request-store'
import { useEnvironmentStore } from '../store/environment-store'

interface CodeGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CodeGeneratorModal({ isOpen, onClose }: CodeGeneratorModalProps) {
  const [language, setLanguage] = useState('java-resttemplate')
  const [copied, setCopied] = useState(false)
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const getVariables = useEnvironmentStore((state) => state.getVariables)

  if (!isOpen) return null

  const generateCode = () => {
    const env = getVariables()

    switch (language) {
      case 'curl':
        return CodeGenerator.generateCurl(currentRequest, env)
      case 'java-resttemplate':
        return CodeGenerator.generateRestTemplate(currentRequest, env)
      case 'java-webclient':
        return CodeGenerator.generateWebClient(currentRequest, env)
      case 'java-feign':
        return CodeGenerator.generateFeignClient(currentRequest, env)
      case 'java-okhttp':
        return CodeGenerator.generateOkHttp(currentRequest, env)
      case 'java-junit':
        return CodeGenerator.generateJUnit(currentRequest, env)
      case 'python':
        return CodeGenerator.generatePython(currentRequest, env)
      case 'javascript':
        return CodeGenerator.generateJavaScript(currentRequest, env)
      case 'node-axios':
        return CodeGenerator.generateNodeAxios(currentRequest, env)
      case 'go':
        return CodeGenerator.generateGo(currentRequest, env)
      default:
        return ''
    }
  }

  const code = generateCode()

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEditorLanguage = () => {
    switch (language) {
      case 'java-resttemplate':
      case 'java-webclient':
      case 'java-feign':
      case 'java-okhttp':
      case 'java-junit':
        return 'java'
      case 'python':
        return 'python'
      case 'javascript':
      case 'node-axios':
        return 'javascript'
      case 'go':
        return 'go'
      default:
        return 'shell'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-[800px] max-h-[600px] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Generate Code</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        </div>

        <div className="p-4 border-b border-border flex items-center gap-4">
          <label className="text-sm font-medium">Language:</label>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-64"
          >
            <optgroup label="☕ Java / Spring Boot">
              <option value="java-resttemplate">Java - RestTemplate</option>
              <option value="java-webclient">Java - WebClient (Reactive)</option>
              <option value="java-feign">Java - Feign Client</option>
              <option value="java-okhttp">Java - OkHttp</option>
              <option value="java-junit">Java - JUnit Test</option>
            </optgroup>
            <optgroup label="🌐 Other Languages">
              <option value="curl">cURL</option>
              <option value="python">Python (requests)</option>
              <option value="javascript">JavaScript (Fetch)</option>
              <option value="node-axios">Node.js (Axios)</option>
              <option value="go">Go</option>
            </optgroup>
          </Select>
          <Button onClick={handleCopy} variant="outline" size="sm" className="ml-auto">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="400px"
            language={getEditorLanguage()}
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  )
}
