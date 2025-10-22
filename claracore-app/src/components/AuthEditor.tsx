import { Select } from './ui/select'
import { Input } from './ui/input'
import { useRequestStore } from '../store/request-store'
import { AuthType } from '../types'

export default function AuthEditor() {
  const currentRequest = useRequestStore((state) => state.currentRequest)
  const setAuth = useRequestStore((state) => state.setAuth)

  const authType = currentRequest.auth.type

  const handleAuthTypeChange = (type: AuthType) => {
    setAuth({ type })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium w-32">Auth Type:</label>
        <Select
          value={authType}
          onChange={(e) => handleAuthTypeChange(e.target.value as AuthType)}
          className="flex-1 max-w-md"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
          <option value="oauth2">OAuth 2.0</option>
        </Select>
      </div>

      {authType === 'bearer' && (
        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Token:</label>
            <Input
              placeholder="Enter bearer token"
              value={currentRequest.auth.bearer?.token || ''}
              onChange={(e) =>
                setAuth({
                  type: 'bearer',
                  bearer: { token: e.target.value },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
        </div>
      )}

      {authType === 'basic' && (
        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Username:</label>
            <Input
              placeholder="Enter username"
              value={currentRequest.auth.basic?.username || ''}
              onChange={(e) =>
                setAuth({
                  type: 'basic',
                  basic: {
                    username: e.target.value,
                    password: currentRequest.auth.basic?.password || '',
                  },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Password:</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={currentRequest.auth.basic?.password || ''}
              onChange={(e) =>
                setAuth({
                  type: 'basic',
                  basic: {
                    username: currentRequest.auth.basic?.username || '',
                    password: e.target.value,
                  },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
        </div>
      )}

      {authType === 'api-key' && (
        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Key:</label>
            <Input
              placeholder="e.g., X-API-Key"
              value={currentRequest.auth.apiKey?.key || ''}
              onChange={(e) =>
                setAuth({
                  type: 'api-key',
                  apiKey: {
                    key: e.target.value,
                    value: currentRequest.auth.apiKey?.value || '',
                    in: currentRequest.auth.apiKey?.in || 'header',
                  },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Value:</label>
            <Input
              placeholder="Enter API key value"
              value={currentRequest.auth.apiKey?.value || ''}
              onChange={(e) =>
                setAuth({
                  type: 'api-key',
                  apiKey: {
                    key: currentRequest.auth.apiKey?.key || '',
                    value: e.target.value,
                    in: currentRequest.auth.apiKey?.in || 'header',
                  },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Add to:</label>
            <Select
              value={currentRequest.auth.apiKey?.in || 'header'}
              onChange={(e) =>
                setAuth({
                  type: 'api-key',
                  apiKey: {
                    key: currentRequest.auth.apiKey?.key || '',
                    value: currentRequest.auth.apiKey?.value || '',
                    in: e.target.value as 'header' | 'query',
                  },
                })
              }
              className="flex-1 max-w-md"
            >
              <option value="header">Header</option>
              <option value="query">Query Params</option>
            </Select>
          </div>
        </div>
      )}

      {authType === 'oauth2' && (
        <div className="space-y-3 pl-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium w-28">Access Token:</label>
            <Input
              placeholder="Enter access token"
              value={currentRequest.auth.oauth2?.accessToken || ''}
              onChange={(e) =>
                setAuth({
                  type: 'oauth2',
                  oauth2: {
                    accessToken: e.target.value,
                    tokenType: currentRequest.auth.oauth2?.tokenType || 'Bearer',
                  },
                })
              }
              className="flex-1 max-w-md"
            />
          </div>
        </div>
      )}
    </div>
  )
}
