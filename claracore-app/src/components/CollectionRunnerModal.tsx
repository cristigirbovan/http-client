import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { X, Play, Square, Upload, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Collection, CollectionRunConfig, CollectionRunResult, RequestRunResult } from '../types'
import { collectionRunner, CollectionRunner } from '../lib/collection-runner'
import { useEnvironmentStore } from '../store/environment-store'

interface CollectionRunnerModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection
}

export default function CollectionRunnerModal({ isOpen, onClose, collection }: CollectionRunnerModalProps) {
  const [iterations, setIterations] = useState(1)
  const [delay, setDelay] = useState(0)
  const [stopOnError, setStopOnError] = useState(false)
  const [dataFile, setDataFile] = useState<File | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [runResult, setRunResult] = useState<CollectionRunResult | null>(null)
  const [progress, setProgress] = useState<RequestRunResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getVariables = useEnvironmentStore((state) => state.getVariables)

  if (!isOpen) return null

  const handleRun = async () => {
    setIsRunning(true)
    setProgress([])
    setRunResult(null)

    try {
      // Parse data file if provided
      let parsedDataFile = undefined
      if (dataFile) {
        const text = await dataFile.text()
        const data = dataFile.name.endsWith('.json')
          ? CollectionRunner.parseJSON(text)
          : CollectionRunner.parseCSV(text)
        parsedDataFile = {
          type: dataFile.name.endsWith('.json') ? 'json' as const : 'csv' as const,
          data,
        }
      }

      const config: CollectionRunConfig = {
        collectionId: collection.id,
        iterations: parsedDataFile ? parsedDataFile.data.length : iterations,
        delay,
        stopOnError,
        saveResponses: true,
        dataFile: parsedDataFile,
      }

      const variables = getVariables()

      const result = await collectionRunner.runCollection(
        collection,
        config,
        variables,
        (requestResult) => {
          setProgress((prev) => [...prev, requestResult])
        }
      )

      setRunResult(result)
    } catch (error: any) {
      alert(`Collection run failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = () => {
    collectionRunner.stop()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDataFile(file)
    }
  }

  const totalRequests = collection.requests.length +
    collection.folders.reduce((sum, folder) => sum + getAllRequestsCount(folder), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-[800px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Run Collection</h2>
            <p className="text-sm text-muted-foreground">{collection.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!runResult ? (
            // Configuration
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Iterations
                  <span className="text-muted-foreground ml-2">(number of times to run)</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
                  disabled={isRunning || !!dataFile}
                />
                {dataFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Using data file ({dataFile.name}) - will run {dataFile.name.endsWith('.json') ? 'once per JSON object' : 'once per CSV row'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delay Between Requests
                  <span className="text-muted-foreground ml-2">(milliseconds)</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value) || 0)}
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stopOnError}
                    onChange={(e) => setStopOnError(e.target.checked)}
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Stop on Error</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Stop running if any request fails
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Data File (Optional)
                  <span className="text-muted-foreground ml-2">(CSV or JSON)</span>
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRunning}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {dataFile ? dataFile.name : 'Upload File'}
                  </Button>
                  {dataFile && (
                    <Button
                      variant="outline"
                      onClick={() => setDataFile(null)}
                      disabled={isRunning}
                    >
                      Clear
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV: First row = column names, data rows become variables
                  <br />
                  JSON: Array of objects or single object
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Requests:</span>
                  <span className="font-semibold">{totalRequests}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Iterations:</span>
                  <span className="font-semibold">{dataFile ? '(from file)' : iterations}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span className="font-semibold">
                    {formatEstimatedTime(totalRequests * (dataFile ? 1 : iterations), delay)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Results
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{runResult.totalRequests}</div>
                    <div className="text-xs text-muted-foreground">Total Requests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{runResult.successfulRequests}</div>
                    <div className="text-xs text-muted-foreground">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500">{runResult.failedRequests}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatDuration(runResult.endTime - runResult.startTime)}</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Request Results</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {runResult.results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        result.success
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{result.requestName}</div>
                          <div className="text-xs text-muted-foreground">
                            Iteration {result.iteration} • {result.response.status} {result.response.statusText} • {result.response.time.toFixed(0)}ms
                          </div>
                          {result.error && (
                            <div className="text-xs text-red-500 mt-1">{result.error}</div>
                          )}
                          {result.dataRow && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Data: {JSON.stringify(result.dataRow)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress during run */}
          {isRunning && progress.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Running... ({progress.length} requests completed)</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {progress.slice(-5).reverse().map((result, idx) => (
                  <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-medium">{result.requestName}</span>
                      <span className="text-muted-foreground text-xs">
                        {result.response.status} • {result.response.time.toFixed(0)}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isRunning && (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                <span>Running collection...</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {!runResult && !isRunning && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleRun}>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
              </>
            )}
            {isRunning && (
              <Button variant="outline" onClick={handleStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            {runResult && (
              <>
                <Button variant="outline" onClick={() => setRunResult(null)}>
                  Run Again
                </Button>
                <Button onClick={onClose}>Close</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getAllRequestsCount(folder: any): number {
  let count = folder.requests?.length || 0
  folder.folders?.forEach((f: any) => {
    count += getAllRequestsCount(f)
  })
  return count
}

function formatEstimatedTime(totalRequests: number, delayPerRequest: number): string {
  const avgRequestTime = 500 // Assume 500ms average per request
  const totalMs = totalRequests * (avgRequestTime + delayPerRequest)

  if (totalMs < 1000) return `${totalMs}ms`
  if (totalMs < 60000) return `${(totalMs / 1000).toFixed(1)}s`
  return `${Math.floor(totalMs / 60000)}m ${Math.floor((totalMs % 60000) / 1000)}s`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}
