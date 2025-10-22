import { app, BrowserWindow, ipcMain, session } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import axios from 'axios'

let mainWindow: BrowserWindow | null = null
let javaProcess: ChildProcess | null = null

const isDev = process.env.NODE_ENV === 'development'
const JAVA_SIDECAR_PORT = 9090
const JAVA_SIDECAR_URL = `http://localhost:${JAVA_SIDECAR_PORT}`

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    title: 'ClaraCore',
    backgroundColor: '#1a1a1a',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Set custom User-Agent
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'ClaraCore/1.0.0'
    callback({ requestHeaders: details.requestHeaders })
  })
}

/**
 * Start Java sidecar process
 */
async function startJavaSidecar(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('[Java Sidecar] Starting Java process...')

    // Path to Java sidecar JAR
    const jarPath = isDev
      ? path.join(__dirname, '../../claracore-java/target/claracore-java-sidecar-1.0.0.jar')
      : path.join(process.resourcesPath, 'claracore-java-sidecar-1.0.0.jar')

    // Start Java process
    javaProcess = spawn('java', ['-jar', jarPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    javaProcess.stdout?.on('data', (data) => {
      console.log('[Java Sidecar]', data.toString())
    })

    javaProcess.stderr?.on('data', (data) => {
      console.error('[Java Sidecar Error]', data.toString())
    })

    javaProcess.on('error', (error) => {
      console.error('[Java Sidecar] Failed to start:', error)
      resolve(false)
    })

    javaProcess.on('exit', (code) => {
      console.log('[Java Sidecar] Process exited with code:', code)
      javaProcess = null
    })

    // Wait for sidecar to be ready (health check)
    const maxAttempts = 30
    let attempts = 0

    const checkHealth = setInterval(async () => {
      attempts++
      try {
        const response = await axios.get(`${JAVA_SIDECAR_URL}/api/scripts/health`, {
          timeout: 1000,
        })
        if (response.status === 200) {
          console.log('[Java Sidecar] Ready!')
          clearInterval(checkHealth)
          resolve(true)
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.error('[Java Sidecar] Failed to start after 30 attempts')
          clearInterval(checkHealth)
          resolve(false)
        }
      }
    }, 1000)
  })
}

/**
 * Stop Java sidecar process
 */
function stopJavaSidecar() {
  if (javaProcess) {
    console.log('[Java Sidecar] Stopping Java process...')
    javaProcess.kill()
    javaProcess = null
  }
}

app.whenReady().then(async () => {
  // Start Java sidecar first
  const javaSidecarStarted = await startJavaSidecar()

  if (!javaSidecarStarted) {
    console.warn('[Java Sidecar] Failed to start, but continuing with app...')
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopJavaSidecar()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopJavaSidecar()
})

// IPC Handlers
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

ipcMain.handle('app:getPlatform', () => {
  return process.platform
})

ipcMain.handle('java:isRunning', () => {
  return javaProcess !== null
})

ipcMain.handle('java:getUrl', () => {
  return JAVA_SIDECAR_URL
})
