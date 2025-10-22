import { useState, useEffect } from 'react'
import { useRequestStore } from '../store/request-store'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Play, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import Editor from '@monaco-editor/react'

export default function ScriptsTab() {
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const setPreRequestScript = useRequestStore((state) => state.setPreRequestScript)
  const setTestScript = useRequestStore((state) => state.setTestScript)

  const [activeTab, setActiveTab] = useState('pre-request')
  const [preRequestCode, setPreRequestCode] = useState(currentRequest.preRequestScript || '')
  const [testCode, setTestCode] = useState(currentRequest.testScript || '')

  // Sync with store when request changes
  useEffect(() => {
    setPreRequestCode(currentRequest.preRequestScript || '')
    setTestCode(currentRequest.testScript || '')
  }, [currentRequest.id])

  const handlePreRequestChange = (value: string | undefined) => {
    const code = value || ''
    setPreRequestCode(code)
    setPreRequestScript(code)
  }

  const handleTestChange = (value: string | undefined) => {
    const code = value || ''
    setTestCode(code)
    setTestScript(code)
  }

  const preRequestTemplate = `// Pre-request Script (Java)
// This script runs BEFORE the request is sent

// Access environment variables
String baseUrl = (String) pm.getEnvironmentVariable("baseUrl");
console.log("Base URL:", baseUrl);

// Set environment variables
pm.setEnvironmentVariable("timestamp", System.currentTimeMillis());

// Generate authentication token
String token = "Bearer " + java.util.UUID.randomUUID().toString();
pm.setEnvironmentVariable("authToken", token);

// Access request
Map<String, Object> request = pm.getRequest();
console.log("Request URL:", request.get("url"));
`

  const testTemplate = `// Test Script (Java)
// This script runs AFTER the response is received

// Access response
Map<String, Object> response = pm.getResponse();
int statusCode = (int) response.get("statusCode");
String body = (String) response.get("body");

// Run assertions
test.assertStatusCode("Status is 200", 200, statusCode);
test.assertNotNull("Response body exists", body);

// Extract data from response
if (body.contains("\\"token\\"")) {
    // Simple JSON extraction (use proper JSON parser in production)
    int start = body.indexOf("\\"token\\":\\"") + 9;
    int end = body.indexOf("\\"", start);
    String token = body.substring(start, end);

    // Save to environment
    pm.setEnvironmentVariable("authToken", token);
    console.log("Saved token:", token);

    // Verify token was saved
    test.assertNotNull("Token saved", pm.getEnvironmentVariable("authToken"));
}

// Assert response content
test.assertContains("Body contains 'success'", body, "success");

// Log results
console.log("Response time:", response.get("responseTime"), "ms");
console.log("Response size:", response.get("responseSize"), "bytes");
`

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList>
            <TabsTrigger value="pre-request">Pre-request Script</TabsTrigger>
            <TabsTrigger value="test">Test Script</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Pre-request Script Tab */}
          <TabsContent value="pre-request" className="h-full m-0 p-0">
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Write Java code to execute before the request
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreRequestChange(preRequestTemplate)}
                >
                  Load Template
                </Button>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="java"
                  value={preRequestCode}
                  onChange={handlePreRequestChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Test Script Tab */}
          <TabsContent value="test" className="h-full m-0 p-0">
            <div className="h-full flex flex-col">
              <div className="p-2 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Write Java code to test the response
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestChange(testTemplate)}
                >
                  Load Template
                </Button>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="java"
                  value={testCode}
                  onChange={handleTestChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="h-full m-0 p-4 overflow-y-auto">
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-semibold mb-2">ClaraCore Script API</h3>
                <p className="text-sm text-muted-foreground">
                  Scripts are written in Java and executed using Janino compiler. You have access to
                  the <code className="bg-muted px-1 py-0.5 rounded">pm</code>, <code className="bg-muted px-1 py-0.5 rounded">console</code>, and <code className="bg-muted px-1 py-0.5 rounded">test</code> objects.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Environment Variables</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                    <div>pm.setEnvironmentVariable("key", value);</div>
                    <div>pm.getEnvironmentVariable("key");</div>
                    <div>pm.unsetEnvironmentVariable("key");</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Global Variables</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                    <div>pm.setGlobalVariable("key", value);</div>
                    <div>pm.getGlobalVariable("key");</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Console Logging</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                    <div>console.log("message", value);</div>
                    <div>console.info("info message");</div>
                    <div>console.warn("warning");</div>
                    <div>console.error("error");</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Test Assertions</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                    <div>test.assertEquals("name", expected, actual);</div>
                    <div>test.assertTrue("name", condition);</div>
                    <div>test.assertNotNull("name", value);</div>
                    <div>test.assertContains("name", text, substring);</div>
                    <div>test.assertStatusCode("name", 200, statusCode);</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Access Request/Response</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                    <div>Map&lt;String, Object&gt; request = pm.getRequest();</div>
                    <div>Map&lt;String, Object&gt; response = pm.getResponse();</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-blue-500">Java Scripting</p>
                    <p className="text-muted-foreground">
                      Scripts are compiled at runtime using Janino. Full Java syntax is supported
                      including imports, loops, conditionals, and helper methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
