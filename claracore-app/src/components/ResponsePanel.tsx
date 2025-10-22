import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useRequestStore } from '../store/request-store'
import { formatBytes, formatTime, getStatusColor, stringifyJSON } from '../lib/utils'
import Editor from '@monaco-editor/react'
import { Copy, Check, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

export default function ResponsePanel() {
  const currentResponse = useRequestStore((state) => state.currentResponse)
  const [activeTab, setActiveTab] = useState('body')
  const [copied, setCopied] = useState(false)

  const hasScriptResults = currentResponse?.preRequestScriptResult || currentResponse?.testScriptResult
  const hasTests = currentResponse?.testScriptResult?.testResults && currentResponse.testScriptResult.testResults.length > 0

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
            {hasScriptResults && <TabsTrigger value="console">Console</TabsTrigger>}
            {hasTests && <TabsTrigger value="tests">Tests</TabsTrigger>}
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

          {/* Console Tab */}
          {hasScriptResults && (
            <TabsContent value="console" className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Pre-request Script Console */}
                {currentResponse.preRequestScriptResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <h3 className="font-semibold">Pre-request Script</h3>
                      {currentResponse.preRequestScriptResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {currentResponse.preRequestScriptResult.executionTime}ms
                      </span>
                    </div>

                    {currentResponse.preRequestScriptResult.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm text-red-500">
                        {currentResponse.preRequestScriptResult.error}
                      </div>
                    )}

                    {currentResponse.preRequestScriptResult.consoleOutput?.map((line, i) => (
                      <div key={i} className="font-mono text-sm p-2 bg-muted/50 rounded">
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {/* Test Script Console */}
                {currentResponse.testScriptResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <h3 className="font-semibold">Test Script</h3>
                      {currentResponse.testScriptResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {currentResponse.testScriptResult.executionTime}ms
                      </span>
                    </div>

                    {currentResponse.testScriptResult.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-sm text-red-500">
                        {currentResponse.testScriptResult.error}
                      </div>
                    )}

                    {currentResponse.testScriptResult.consoleOutput?.map((line, i) => (
                      <div key={i} className="font-mono text-sm p-2 bg-muted/50 rounded">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Tests Tab */}
          {hasTests && (
            <TabsContent value="tests" className="h-full overflow-y-auto p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4 pb-3 border-b border-border">
                  <h3 className="font-semibold">Test Results</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-500">
                      {currentResponse.testScriptResult!.testResults!.filter(t => t.passed).length} passed
                    </span>
                    <span className="text-red-500">
                      {currentResponse.testScriptResult!.testResults!.filter(t => !t.passed).length} failed
                    </span>
                  </div>
                </div>

                {currentResponse.testScriptResult!.testResults!.map((test, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border ${
                      test.passed
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {test.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{test.name}</div>
                        <div className={`text-sm mt-1 ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {test.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
