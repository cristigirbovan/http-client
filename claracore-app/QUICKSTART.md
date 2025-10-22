# ClaraCore - Quick Start Guide

## Step-by-Step Installation

### 1. Prerequisites Check
```bash
node --version   # Must be v18 or higher
npm --version    # Should be 9.x or higher
```

If you don't have Node.js, download from: https://nodejs.org/

### 2. Install Dependencies

```bash
cd claracore-app
npm install
```

**This will take 5-10 minutes.** You should see:
- ✓ Installing packages...
- ✓ Downloading Electron binary...
- ✓ Building native modules...

### 3. Run in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start Vite dev server on port 5173
2. Launch Electron app
3. Open with DevTools

### 4. Test the Application

Once the app launches:
1. Enter a URL (e.g., `https://jsonplaceholder.typicode.com/posts/1`)
2. Click "Send"
3. Check the response viewer

### Common Issues & Fixes

#### Issue: "npm install" fails
**Fix:**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Electron download fails
**Fix:**
```bash
# Use mirror
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install
```

#### Issue: Port 5173 already in use
**Fix:** Kill the process using port 5173 or change port in `vite.config.ts`

#### Issue: TypeScript errors
**Fix:**
```bash
# Reinstall types
npm install @types/node @types/react @types/react-dom --save-dev
```

## Building for Production

### Build executable:
```bash
npm run electron:build
```

Output will be in `release/` folder:
- **Windows**: `ClaraCore Setup x.x.x.exe` (installer) or `ClaraCore x.x.x.exe` (portable)
- **macOS**: `ClaraCore-x.x.x.dmg`
- **Linux**: `ClaraCore-x.x.x.AppImage`

## Customizing

### Change User-Agent (for research):
Edit `electron/main.ts` line 40:
```typescript
details.requestHeaders['User-Agent'] = 'MyCustomClient/1.0.0'
```

### Change App Name:
Edit `package.json`:
```json
{
  "name": "my-app-name",
  "productName": "My App Name"
}
```

## Troubleshooting Development

### Enable verbose logging:
```bash
DEBUG=* npm run electron:dev
```

### Check TypeScript compilation:
```bash
npm run type-check
```

### Run linter:
```bash
npm run lint
```

## Expected Behavior

### ✅ Working correctly:
- App window opens
- Can enter URL and send requests
- Response shows with syntax highlighting
- Can save to collections
- History tracks requests

### ❌ Known limitations (will fix in updates):
- No import/export yet
- Environment variables UI needs polish
- Some edge cases in error handling

## Getting Help

1. Check console for errors (F12 / Cmd+Option+I)
2. Check terminal output
3. Read full docs in README.md and SETUP.md

## Next Steps

After successful installation:
1. ✅ Test basic GET request
2. ✅ Test POST with JSON body
3. ✅ Try authentication
4. ✅ Save to collection
5. ✅ Generate code snippet

---

**Note:** This is a custom-built HTTP client. It may have bugs. Please report any issues you find!
