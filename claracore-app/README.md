# ClaraCore - Professional HTTP Client

A production-grade, Electron-based HTTP client application built with React, TypeScript, and modern web technologies.

## Features

### Core Functionality
- **Full HTTP Method Support**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Advanced Request Builder**: Build complex HTTP requests with ease
- **Response Viewer**: Syntax-highlighted response viewer with JSON, XML, HTML support
- **Request History**: Automatic history tracking of all requests
- **Collections**: Organize requests into collections
- **Environment Variables**: Support for {{variable}} replacement

### Authentication
- **Bearer Token**: Add Authorization: Bearer tokens
- **Basic Auth**: Username/password authentication
- **API Key**: Custom API key in header or query params
- **OAuth 2.0**: OAuth 2.0 access token support

### Advanced Features
- **Monaco Editor**: VSCode-quality code editor for request/response bodies
- **Syntax Highlighting**: Beautiful syntax highlighting for various formats
- **Dark Theme**: Professional dark theme optimized for developers
- **Persistence**: All data persisted locally using Zustand
- **Real-time Updates**: Instant feedback and response times
- **Copy to Clipboard**: Quick copy functionality for responses

## Technology Stack

- **Electron 28**: Desktop application framework
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Ultra-fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Monaco Editor**: Code editor (VSCode engine)
- **Axios**: HTTP client library
- **React Query**: Data fetching and caching

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone or navigate to the project:
```bash
cd claracore-app
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run electron:dev
```

4. Build for production:
```bash
npm run electron:build
```

## Development

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run electron:dev` - Start Electron app in development mode
- `npm run build` - Build for production
- `npm run electron:build` - Build and package Electron app
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Project Structure

```
claracore-app/
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry
│   └── preload.ts     # Preload script
├── src/
│   ├── components/    # React components
│   │   ├── ui/       # Base UI components
│   │   ├── Sidebar.tsx
│   │   ├── RequestPanel.tsx
│   │   └── ResponsePanel.tsx
│   ├── store/        # Zustand stores
│   │   ├── request-store.ts
│   │   ├── collection-store.ts
│   │   ├── environment-store.ts
│   │   └── history-store.ts
│   ├── lib/          # Utilities and libraries
│   │   ├── http-client.ts
│   │   └── utils.ts
│   ├── types/        # TypeScript types
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # React entry point
│   └── index.css     # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Features in Detail

### Request Builder
- URL input with variable replacement support
- HTTP method selection
- Query parameters editor
- Headers editor
- Multiple body types: JSON, XML, Raw, Form Data
- Authentication configuration

### Response Viewer
- Status code display with color coding
- Response time and size metrics
- Syntax-highlighted body viewer
- Headers inspection
- Copy to clipboard functionality

### Collections
- Create and organize collections
- Save requests to collections
- Quick load from collections

### History
- Automatic request history
- Filter and search history
- Load previous requests
- Clear history option

### Environment Variables
- Create multiple environments
- Variable replacement using {{var}} syntax
- Switch between environments
- Secure variable storage

## Custom Fingerprint

ClaraCore uses a custom User-Agent header (`ClaraCore/1.0.0`) instead of typical Postman fingerprints, making it suitable for research and testing scenarios where you need control over your HTTP client's identity.

## Building for Distribution

### Windows
```bash
npm run electron:build
```
Creates both NSIS installer and portable .exe in `release/` folder.

### macOS
```bash
npm run electron:build
```
Creates .dmg and .zip in `release/` folder.

### Linux
```bash
npm run electron:build
```
Creates AppImage, .deb, and .rpm in `release/` folder.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please create an issue in the repository.

---

**ClaraCore** - Built for developers, by developers.
