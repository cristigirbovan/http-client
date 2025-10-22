import { useRequestStore } from '../store/request-store'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Select } from './ui/select'

export default function RequestSettingsPanel() {
  const settings = useRequestStore((state) => state.currentRequest.settings || {})
  const updateSettings = useRequestStore((state) => state.updateSettings)

  const handleTimeoutChange = (value: string) => {
    const timeout = parseInt(value) || 30000
    updateSettings({ timeout })
  }

  const handleMaxRedirectsChange = (value: string) => {
    const maxRedirects = parseInt(value) || 5
    updateSettings({ maxRedirects })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Request Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure advanced settings for this request. These settings override global defaults.
        </p>
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <Label htmlFor="timeout">Request Timeout</Label>
        <div className="flex items-center gap-3">
          <Input
            id="timeout"
            type="number"
            value={settings.timeout || 30000}
            onChange={(e) => handleTimeoutChange(e.target.value)}
            className="w-32"
            min={1000}
            max={300000}
            step={1000}
          />
          <span className="text-sm text-muted-foreground">milliseconds</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum time to wait for response. Default: 30000ms (30 seconds)
        </p>
      </div>

      {/* Follow Redirects */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="follow-redirects">Follow Redirects</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically follow HTTP redirects (3xx status codes)
            </p>
          </div>
          <Switch
            id="follow-redirects"
            checked={settings.followRedirects !== false}
            onCheckedChange={(checked) => updateSettings({ followRedirects: checked })}
          />
        </div>

        {/* Max Redirects (only show if followRedirects is enabled) */}
        {settings.followRedirects !== false && (
          <div className="ml-4 mt-2">
            <Label htmlFor="max-redirects" className="text-sm">
              Maximum Redirects
            </Label>
            <div className="flex items-center gap-3 mt-1">
              <Input
                id="max-redirects"
                type="number"
                value={settings.maxRedirects || 5}
                onChange={(e) => handleMaxRedirectsChange(e.target.value)}
                className="w-24"
                min={1}
                max={20}
              />
              <span className="text-xs text-muted-foreground">Default: 5</span>
            </div>
          </div>
        )}
      </div>

      {/* SSL Certificate Validation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="validate-ssl">SSL Certificate Validation</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Verify SSL/TLS certificates. Disable for self-signed certificates (not recommended for production)
            </p>
          </div>
          <Switch
            id="validate-ssl"
            checked={settings.validateSSL !== false}
            onCheckedChange={(checked) => updateSettings({ validateSSL: checked })}
          />
        </div>
      </div>

      {/* Response Encoding */}
      <div className="space-y-2">
        <Label htmlFor="encoding">Response Encoding</Label>
        <Select
          id="encoding"
          value={settings.encoding || 'utf-8'}
          onChange={(e) => updateSettings({ encoding: e.target.value })}
          className="w-48"
        >
          <option value="utf-8">UTF-8</option>
          <option value="ascii">ASCII</option>
          <option value="latin1">Latin-1</option>
          <option value="base64">Base64</option>
          <option value="binary">Binary</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Character encoding for response body. Default: UTF-8
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">Settings Scope</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• These settings apply only to this specific request</li>
          <li>• Folder and collection-level settings coming soon</li>
          <li>• Settings are saved with the request in collections</li>
        </ul>
      </div>

      {/* Reset Button */}
      <div className="pt-4">
        <button
          onClick={() => updateSettings({})}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
