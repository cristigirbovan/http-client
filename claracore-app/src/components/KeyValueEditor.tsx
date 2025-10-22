import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, X } from 'lucide-react'
import { useRequestStore } from '../store/request-store'

interface KeyValueEditorProps {
  type: 'params' | 'headers'
}

export default function KeyValueEditor({ type }: KeyValueEditorProps) {
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const addHeader = useRequestStore((state) => state.addHeader)
  const updateHeader = useRequestStore((state) => state.updateHeader)
  const removeHeader = useRequestStore((state) => state.removeHeader)
  const addParam = useRequestStore((state) => state.addParam)
  const updateParam = useRequestStore((state) => state.updateParam)
  const removeParam = useRequestStore((state) => state.removeParam)

  const items = type === 'params' ? currentRequest.params : currentRequest.headers
  const addItem = type === 'params' ? addParam : addHeader
  const updateItem = type === 'params' ? updateParam : updateHeader
  const removeItem = type === 'params' ? removeParam : removeHeader

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) =>
                updateItem(item.id, item.key, item.value, e.target.checked)
              }
              className="h-4 w-4"
            />
            <Input
              placeholder="Key"
              value={item.key}
              onChange={(e) =>
                updateItem(item.id, e.target.value, item.value, item.enabled)
              }
              className="flex-1"
            />
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) =>
                updateItem(item.id, item.key, e.target.value, item.enabled)
              }
              className="flex-1"
            />
            <Button
              onClick={() => removeItem(item.id)}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={addItem} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add {type === 'params' ? 'Parameter' : 'Header'}
      </Button>
    </div>
  )
}
