import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
})

// TypeScript declaration for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>
      getPlatform: () => Promise<string>
    }
  }
}
