import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useRequestStore } from '../store/request-store'
import { formatBytes, formatTime, getStatusColor, stringifyJSON } from '../lib/utils'
import Editor from '@monaco-editor/react'
import { Copy, Check } from 'lucide-react'
import { Button } from './ui/button'

export default function ResponsePanel() {
  const currentResponse = useRequestStore((state) => state.currentResponse)
  const [activeTab, setActiveTab] = useState('body')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (currentResponse?.data) {
      const text = typeof currentResponse.data === 'string'
        ? currentResponse.data
        : stringifyJSON(currentResponse.data)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!currentResponse) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-lg">No Response Yet</p>
          <p className="text-muted-foreground text-sm">
            Send a request to see the response here
          </p>
        </div>
      </div>
    )
  }

  const formatResponseBody = () => {
    if (!currentResponse.data) return ''

    if (typeof currentResponse.data === 'string') {
      return currentResponse.data
    }

    return stringifyJSON(currentResponse.data, true)
  }

  const getLanguage = () => {
    const contentType = currentResponse.headers?.['content-type'] || ''
    if (contentType.includes('json')) return 'json'
    if (contentType.includes('xml')) return 'xml'
    if (contentType.includes('html')) return 'html'
    if (contentType.includes('javascript')) return 'javascript'
    return 'text'
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Status Bar */}
      <div className="border-b border-border p-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm font-bold ${getStatusColor(currentResponse.status)}`}>
            {currentResponse.status} {currentResponse.statusText}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time:</span>
          <span className="text-sm text-muted-foreground">
            {formatTime(currentResponse.time)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Size:</span>
          <span className="text-sm text-muted-foreground">
            {formatBytes(currentResponse.size)}
          </span>
        </div>
        <div className="ml-auto">
          <Button onClick={handleCopy} variant="outline" size="sm">
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
      </div>

      {/* Response Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-4">
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="body" className="h-full">
            <Editor
              height="100%"
              language={getLanguage()}
              value={formatResponseBody()}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
              }}
            />
          </TabsContent>

          <TabsContent value="headers" className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
              {Object.entries(currentResponse.headers || {}).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[200px_1fr] gap-4 p-2 rounded bg-muted/50 font-mono text-sm"
                >
                  <div className="font-semibold truncate">{key}:</div>
                  <div className="text-muted-foreground break-all">{value}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
