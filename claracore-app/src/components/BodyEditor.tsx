import { useState } from 'react'
import { Select } from './ui/select'
import { useRequestStore } from '../store/request-store'
import Editor from '@monaco-editor/react'

export default function BodyEditor() {
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const setBody = useRequestStore((state) => state.setBody)

  const bodyType = currentRequest.body?.type || 'none'
  const bodyContent = currentRequest.body?.content || ''

  const handleBodyTypeChange = (type: string) => {
    setBody(type as any, bodyContent)
  }

  const handleBodyContentChange = (value: string | undefined) => {
    setBody(bodyType as any, value || '')
  }

  const getLanguage = () => {
    switch (bodyType) {
      case 'json':
        return 'json'
      case 'xml':
        return 'xml'
      default:
        return 'text'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Body Type:</label>
        <Select
          value={bodyType}
          onChange={(e) => handleBodyTypeChange(e.target.value)}
          className="w-64"
        >
          <option value="none">None</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="raw">Raw</option>
          <option value="form-data">Form Data</option>
          <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
        </Select>
      </div>

      {bodyType !== 'none' && (
        <div className="border border-border rounded-md overflow-hidden">
          <Editor
            height="300px"
            language={getLanguage()}
            value={bodyContent}
            onChange={handleBodyContentChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      )}
    </div>
  )
}
