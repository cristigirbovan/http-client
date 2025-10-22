# ClaraCore - HTTP Client for Java Developers

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-beta-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

**ClaraCore** is a production-grade HTTP client application specifically designed for Java and Spring Boot developers. It provides full REST API testing capabilities with excellent Java code generation, Postman compatibility, and a modern Electron-based desktop interface.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java 17+ (for script execution - optional)
- Maven 3.8+ (for Java sidecar - optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/cristigirbovan/http-client.git
cd http-client/claracore-app

# Install dependencies
npm install

# Run the application
npm run dev
```

The application will start on `http://localhost:5173`

## ✨ Key Features

### ✅ Fully Working Features (Use Today)

#### Core HTTP Client
- All HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Headers, query parameters, request body (JSON, XML, Form-Data, URL-encoded, Raw)
- Response display with status, headers, body, timing, and size
- Request settings: timeout, redirects, SSL validation

#### Authentication
- Bearer Token
- Basic Authentication (username/password)
- API Key (header or query parameter)
- OAuth 2.0 with custom token types

#### Environment Variables & Dynamic Data
- Multiple environments (dev, staging, production)
- `{{variable}}` syntax for environment variables
- 40+ dynamic variables:
  - Timestamps: `{{$timestamp}}`, `{{$isoTimestamp}}`
  - Random data: `{{$randomInt}}`, `{{$randomEmail}}`, `{{$randomUUID}}`
  - Names: `{{$randomFirstName}}`, `{{$randomLastName}}`, `{{$randomFullName}}`
  - Addresses: `{{$randomCity}}`, `{{$randomCountry}}`, `{{$randomZipCode}}`
  - Internet: `{{$randomIP}}`, `{{$randomUrl}}`, `{{$randomUserAgent}}`
  - Commerce: `{{$randomPrice}}`, `{{$randomProduct}}`
  - And 25+ more...

#### Collections & Organization
- Create and organize requests in collections
- Unlimited nested folders (recursive structure)
- Context menus for collections, folders, and requests
- Save requests to collections with folder selection
- Persistent storage (all data saved locally)

#### Collection Runner
- Run entire collections with multiple iterations
- Configurable delays between requests
- Stop-on-error functionality
- CSV and JSON data file support for parameterization
- Real-time progress tracking with success/failure metrics

#### Code Generation (9 Languages)
**Java Frameworks:**
- RestTemplate (Spring Boot classic)
- WebClient (Spring WebFlux reactive)
- Feign Client (microservices)
- OkHttp (Android/standalone)
- JUnit/MockMvc (integration tests)

**Other Languages:**
- cURL (shell scripts)
- Python (requests library)
- JavaScript (Fetch API)
- Go (http package)

#### Import/Export
- **Full Postman v2.1 compatibility**
- Import Postman collections (all structure preserved)
- Import Postman environments
- Export collections to Postman format
- Export environments to Postman format
- Script conversion (JavaScript → Java with comments)

#### Request History
- Automatic tracking of all requests
- Display with status code, timing, and timestamp
- Load previous requests with one click

### ⚠️ Limited/Not Working Features

#### Java Script Execution ❌
- **Status**: Not functional (Java sidecar not implemented)
- Pre-request scripts UI exists but scripts don't execute
- Test scripts UI exists but scripts don't execute
- **Workaround**: Use without scripts, or build the Java sidecar yourself

## 📊 Feature Comparison vs Postman

| Feature | Postman | ClaraCore | Notes |
|---------|---------|-----------|-------|
| HTTP Requests | ✅ | ✅ | Full parity |
| Authentication | ✅ | ✅ | All types supported |
| Environments | ✅ | ✅ | Full parity |
| Dynamic Variables | ✅ | ✅ | 40+ variables |
| Collections | ✅ | ✅ | Unlimited folders |
| Collection Runner | ✅ | ✅ | CSV/JSON support |
| Import/Export | ✅ | ✅ | Full v2.1 compatibility |
| Code Generation (Java) | ⚠️ | ✅ | **ClaraCore better** |
| Code Generation (Others) | ✅ | ⚠️ | Postman has more |
| Scripting | ✅ (JS) | ❌ (Java) | **Needs implementation** |
| Team Collaboration | ✅ | ❌ | Postman only |
| Cloud Sync | ✅ | ❌ | Postman only |
| Offline Mode | ⚠️ | ✅ | **ClaraCore better** |

**Overall**: 75% feature parity for general use, 90% parity for Java developers (excluding scripts)

## 🚀 Usage Examples

### Basic HTTP Request
```
1. Enter URL: https://api.example.com/users
2. Select method: GET
3. Add headers (if needed)
4. Click "Send"
5. View response
```

### Using Environment Variables
```
1. Create environment: "Development"
2. Add variable: api_url = https://dev.api.example.com
3. Add variable: api_key = dev_key_12345
4. In request URL: {{api_url}}/users
5. In header: Authorization: Bearer {{api_key}}
```

### Using Dynamic Variables
```
URL: {{api_url}}/users/{{$randomInt}}
Headers:
  X-Request-ID: {{$guid}}
Body:
{
  "email": "{{$randomEmail}}",
  "name": "{{$randomFullName}}",
  "timestamp": {{$timestamp}}
}
```

### Generating Java Code
```
1. Configure your request (URL, method, headers, body, auth)
2. Click "Code" button
3. Select "Java - RestTemplate" (or WebClient, Feign, etc.)
4. Copy generated code
5. Paste into your Spring Boot service
```

### Migrating from Postman
```
1. Export collection from Postman → .json file
2. In ClaraCore: Menu → File → Import
3. Select your Postman collection file
4. All requests, folders, and auth imported
5. Ready to use immediately
```

### Running Collections
```
1. Select collection
2. Menu → Tools → Collection Runner
3. Configure: iterations (10), delay (1000ms)
4. Optional: Upload CSV/JSON data file
5. Click "Run"
6. Watch real-time progress and results
```

## 🔧 Project Structure

```
http-client/
├── claracore-app/          # Electron + React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Core libraries (http-client, code-generator, etc.)
│   │   ├── store/         # Zustand state management
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── claracore-java/         # Java sidecar (optional, not built)
│   └── src/main/java/
│
├── CLARACORE_ASSESSMENT_2025-10-22.md  # Detailed assessment
├── ASSESSMENT_SUMMARY.txt               # Quick reference
└── QUICK_REFERENCE.md                   # Feature matrix
```

## 📖 Documentation

- **[Comprehensive Assessment](CLARACORE_ASSESSMENT_2025-10-22.md)** - Detailed feature-by-feature analysis
- **[Assessment Summary](ASSESSMENT_SUMMARY.txt)** - What works, what doesn't
- **[Quick Reference](QUICK_REFERENCE.md)** - Feature status matrix and workflows

## 🐛 Known Issues

1. **Java Script Execution Not Working** ❌
   - Java sidecar service not implemented
   - Scripts fail silently
   - Warning banner shows in Scripts tab

2. **Limited Team Features** ⚠️
   - No cloud synchronization
   - No team collaboration
   - All data stored locally only

3. **No GraphQL or WebSocket Support** ⚠️

## 🤝 Contributing

Contributions are welcome! Key areas needing work:
1. **Priority**: Implement Java sidecar for script execution
2. Add GraphQL support
3. Add WebSocket testing
4. Improve test coverage (currently 0%)
5. Add input validation
6. Team collaboration features

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with Electron, React, TypeScript, and Vite
- Inspired by Postman but optimized for Java developers
- Code generation powered by custom templates
- Postman compatibility via v2.1 schema support

## 📧 Support

- Report issues: [GitHub Issues](https://github.com/cristigirbovan/http-client/issues)
- Documentation: See assessment files in repository

---

**Status**: Beta - 75% feature complete, production-ready for HTTP testing and code generation

**Use for**: REST API testing, Java code generation, Postman migration, environment management
**Avoid for**: Script execution, team collaboration, cloud features

Generated with ☕ for Java developers
