import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Send, Save, Loader2, Code } from 'lucide-react'
import { useRequestStore } from '../store/request-store'
import { useHistoryStore } from '../store/history-store'
import { useEnvironmentStore } from '../store/environment-store'
import { httpClient } from '../lib/http-client'
import { HttpMethod } from '../types'
import KeyValueEditor from './KeyValueEditor'
import BodyEditor from './BodyEditor'
import AuthEditor from './AuthEditor'
import CodeGeneratorModal from './CodeGeneratorModal'
import ScriptsTab from './ScriptsTab'

export default function RequestPanel() {
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const setMethod = useRequestStore((state) => state.setMethod)
  const setUrl = useRequestStore((state) => state.setUrl)
  const setName = useRequestStore((state) => state.setName)
  const isLoading = useRequestStore((state) => state.isLoading)
  const setLoading = useRequestStore((state) => state.setLoading)
  const setResponse = useRequestStore((state) => state.setResponse)
  const addToHistory = useHistoryStore((state) => state.addToHistory)
  const getVariables = useEnvironmentStore((state) => state.getVariables)

  const [activeTab, setActiveTab] = useState('params')
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)

  const handleSend = async () => {
    if (!currentRequest.url) {
      alert('Please enter a URL')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const variables = getVariables()
      const response = await httpClient.sendRequest(currentRequest, variables)
      setResponse(response)
      addToHistory(currentRequest, response)
    } catch (error: any) {
      setResponse(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    // TODO: Implement save to collection
    alert('Save to collection - coming soon!')
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Request name"
            value={currentRequest.name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentRequest.method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="w-32"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </Select>

          <Input
            placeholder="Enter request URL"
            value={currentRequest.url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSend()
              }
            }}
          />

          <Button
            onClick={handleSend}
            disabled={isLoading || !currentRequest.url}
            className="min-w-24"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>

          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button onClick={() => setShowCodeGenerator(true)} variant="outline">
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
        </div>
      </div>

      {/* Request Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border px-4">
          <TabsList>
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="scripts">Scripts</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="params">
            <KeyValueEditor type="params" />
          </TabsContent>

          <TabsContent value="auth">
            <AuthEditor />
          </TabsContent>

          <TabsContent value="headers">
            <KeyValueEditor type="headers" />
          </TabsContent>

          <TabsContent value="body">
            <BodyEditor />
          </TabsContent>

          <TabsContent value="scripts" className="h-full">
            <ScriptsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Code Generator Modal */}
      <CodeGeneratorModal
        isOpen={showCodeGenerator}
        onClose={() => setShowCodeGenerator(false)}
      />
    </div>
  )
}
