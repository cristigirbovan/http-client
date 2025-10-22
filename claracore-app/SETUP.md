# ClaraCore Setup Guide

## Complete Installation Instructions

### Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js 18+** (Download from https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 2: Project Setup

1. Navigate to the project directory:
```bash
cd claracore-app
```

2. Install all dependencies:
```bash
npm install
```

This will install:
- Electron and build tools
- React and related libraries
- TypeScript and development tools
- UI libraries (TailwindCSS, Monaco Editor, etc.)

**Note**: This may take 5-10 minutes depending on your internet connection.

### Step 3: Development Mode

Run the application in development mode:
```bash
npm run electron:dev
```

This will:
1. Start the Vite development server (port 5173)
2. Launch the Electron application
3. Enable hot module replacement (HMR) for instant updates
4. Open DevTools automatically

### Step 4: Building for Production

Build the application for your platform:

**For all platforms:**
```bash
npm run electron:build
```

**Platform-specific builds:**

**Windows:**
- Creates NSIS installer (.exe)
- Creates portable executable
- Output: `release/` folder

**macOS:**
- Creates DMG installer
- Creates ZIP archive
- Output: `release/` folder

**Linux:**
- Creates AppImage
- Creates .deb package (Debian/Ubuntu)
- Creates .rpm package (Fedora/RHEL)
- Output: `release/` folder

### Step 5: Running the Built Application

After building, you can find the executable in the `release/` folder:

**Windows:**
- `release/ClaraCore Setup x.x.x.exe` (installer)
- `release/ClaraCore x.x.x.exe` (portable)

**macOS:**
- `release/ClaraCore-x.x.x.dmg`
- `release/ClaraCore-x.x.x-mac.zip`

**Linux:**
- `release/ClaraCore-x.x.x.AppImage`
- `release/claracore_x.x.x_amd64.deb`
- `release/claracore-x.x.x.x86_64.rpm`

## Troubleshooting

### Common Issues

**1. Installation fails with network errors:**
```bash
# Clear npm cache and retry
npm cache clean --force
npm install
```

**2. Electron download fails:**
```bash
# Use a mirror or proxy
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install
```

**3. Build fails on Linux:**
```bash
# Install required dependencies
sudo apt-get install -y build-essential
```

**4. Monaco Editor not loading:**
- Clear browser cache
- Restart the dev server
- Check console for errors

### Development Tips

**Hot Reload:**
- Changes to React components reload automatically
- Changes to Electron main process require restart

**Debugging:**
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open DevTools
- Use React DevTools extension for component debugging
- Check Console for errors and warnings

**Performance:**
- First launch may be slower (compiling, loading)
- Subsequent launches are faster
- Production builds are optimized and faster

## Features Overview

### Request Builder
1. Select HTTP method (GET, POST, PUT, etc.)
2. Enter URL
3. Add query parameters
4. Configure headers
5. Set request body (JSON, XML, etc.)
6. Configure authentication

### Response Viewer
- Status code with color coding
- Response time and size
- Syntax-highlighted body
- Headers inspection
- Copy to clipboard

### Collections
- Create collections to organize requests
- Save requests for reuse
- Quick load from sidebar

### History
- Automatic tracking of all requests
- Quick reload of previous requests
- Search and filter

### Environment Variables
- Create multiple environments (Dev, Staging, Prod)
- Use {{variable}} syntax in URLs, headers, body
- Switch between environments easily

### Code Generation
- Generate equivalent code in multiple languages
- Supports: cURL, Python, JavaScript, Node.js, Go
- Copy to clipboard with one click

## Customization

### Custom Themes
Edit `src/index.css` to customize colors and themes.

### Custom User-Agent
Edit `electron/main.ts` line 40:
```typescript
details.requestHeaders['User-Agent'] = 'YourCustomAgent/1.0.0'
```

### Custom Branding
1. Update `package.json`: Change name and productName
2. Replace icons in `public/` folder
3. Update window title in `electron/main.ts`

## Project Structure

```
claracore-app/
├── electron/              # Electron main process
│   ├── main.ts           # Application entry point
│   └── preload.ts        # Preload scripts
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   └── ...          # Feature components
│   ├── store/           # State management (Zustand)
│   ├── lib/             # Utilities
│   │   ├── http-client.ts    # HTTP engine
│   │   ├── code-generator.ts # Code generation
│   │   └── utils.ts          # Helper functions
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # React entry
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
└── tailwind.config.js   # TailwindCSS config
```

## Next Steps

1. **Add Proxy Support**: Configure proxy settings for corporate networks
2. **SSL Certificates**: Add custom SSL certificate handling
3. **Import/Export**: Add Postman collection import/export
4. **Team Collaboration**: Add cloud sync for team sharing
5. **GraphQL Support**: Add GraphQL request builder
6. **WebSocket Testing**: Add WebSocket connection testing

## Support

For issues, questions, or feature requests:
- Check the README.md file
- Review existing code and comments
- Consult the official documentation for:
  - Electron: https://www.electronjs.org/docs
  - React: https://react.dev/
  - Vite: https://vitejs.dev/

---

**Happy Coding with ClaraCore!**
