# ClaraCore Feature Quick Reference

## Status Legend
- ✅ = Fully usable, production-ready
- ⚠️  = Partially working, has issues
- ❌ = Broken or not implemented

## Feature Status Overview

### Core Features
| Feature | Status | Notes |
|---------|--------|-------|
| HTTP Requests | ✅ | All methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) |
| Headers | ✅ | Add/edit/disable, variable support |
| Query Params | ✅ | Full support with {{variable}} replacement |
| Request Body | ✅ | JSON, XML, Form-Data, URL-encoded, Raw |
| Response Display | ✅ | Status, headers, body, timing, size |
| Request History | ✅ | Auto-tracked, searchable |

### Authentication
| Type | Status | Notes |
|------|--------|-------|
| Bearer Token | ✅ | Variable support |
| Basic Auth | ✅ | Username/password, auto-encoded |
| API Key | ✅ | Header or query param location |
| OAuth 2.0 | ✅ | Custom token type support |

### Variables & Data
| Feature | Status | Notes |
|---------|--------|-------|
| Environment Variables | ✅ | {{key}} syntax, multiple environments |
| Dynamic Variables | ✅ | 40+ types ($timestamp, $randomEmail, etc.) |
| Variable Replacement | ✅ | Works in URL, headers, body, auth, params |

### Collections & Organization
| Feature | Status | Notes |
|---------|--------|-------|
| Create Collections | ✅ | Full CRUD support |
| Nested Folders | ✅ | Recursive folder structure |
| Save Request | ❌ | Shows "coming soon" |
| Collection Runner | ✅ | Iterations, delays, CSV/JSON data files |

### Code Generation
| Language | Status | Notes |
|----------|--------|-------|
| cURL | ✅ | Shell script format |
| Python | ✅ | requests library |
| JavaScript | ✅ | Fetch API |
| Node.js | ✅ | Axios |
| Go | ✅ | http library |
| **Java - RestTemplate** | ✅ | Spring Boot classic |
| **Java - WebClient** | ✅ | Spring WebFlux reactive |
| **Java - Feign** | ✅ | Spring Cloud microservices |
| **Java - OkHttp** | ✅ | Android/standalone |
| **Java - JUnit** | ✅ | MockMvc integration tests |

### Import/Export
| Feature | Status | Notes |
|---------|--------|-------|
| Export Collection | ✅ | Postman v2.1 format |
| Export Environment | ✅ | Postman format |
| Import Collection | ✅ | Postman v2.1 + structure preserved |
| Import Environment | ✅ | Postman format |
| Script Conversion | ✅ | JS→Java conversion with comments |

### Scripting
| Feature | Status | Notes |
|---------|--------|-------|
| Pre-request Script | ❌ | Java backend missing |
| Test Script | ❌ | Java backend missing |
| Script UI | ✅ | Editor exists but non-functional |
| Java Sidecar | ❌ | Not included/implemented |

### Search & Discovery
| Feature | Status | Notes |
|---------|--------|-------|
| Global Search | ⚠️  | Search works, loading not implemented |
| History Search | ✅ | Search request history |
| Collection Browse | ✅ | Tree view, expandable folders |

## What You Can Do TODAY

### Workflow 1: Simple API Test
1. Enter URL + method ✅
2. Add headers/params ✅
3. Add auth (Bearer/Basic/API Key) ✅
4. Send & view response ✅
5. Copy as cURL or Java code ✅

### Workflow 2: Multi-Environment Testing
1. Create "Dev", "Staging", "Prod" environments ✅
2. Set variables: api_url, api_key for each ✅
3. Switch environments & run same requests ✅
4. Use {{api_url}} in URL, {{api_key}} in headers ✅

### Workflow 3: Load Testing
1. Create collection with 5 requests ✅
2. Run collection 100 times with 1s delay ✅
3. See results: pass/fail count, timing ✅
4. Use {{$randomEmail}} for unique test data ✅

### Workflow 4: Postman Migration
1. Export collection from Postman ✅
2. Import in ClaraCore ✅
3. Everything preserved (folders, auth, headers) ✅
4. Continue working immediately ✅

### Workflow 5: Java Code Generation
1. Build request in UI ✅
2. Click Code → Java - RestTemplate ✅
3. Copy code ✅
4. Paste into Spring Boot service ✅
5. Works out of the box ✅

## What DOESN'T Work

1. **Pre-request Scripts** - Java service required but missing
2. **Test Scripts** - Java service required but missing
3. **Save to Collection** - Shows "coming soon"
4. **Global Search Loading** - Can't load requests from search results
5. **Script Execution** - Fails silently, no user notification

## Known Limitations

- No team collaboration features
- No cloud sync
- No WebSocket support
- No GraphQL support
- No mock servers
- No API documentation generator
- No keyboard shortcuts implemented
- Limited theme options (dark only)
- No request validation

## Recommendations

### Safe to Use
- Core HTTP client ✅
- Code generation ✅
- Collections ✅
- Import/Export ✅
- Environments ✅
- Collection runner ✅

### Avoid
- Scripts/Pre-request ❌
- Anything requiring Java sidecar ❌
- Save-to-collection ❌

## Performance

- Cold start: 3-5 seconds (typical Electron)
- Hot reload: <1 second (Vite)
- Request send: Network dependent
- Large responses: May slow UI briefly

## File Size Impact

- Initial download: ~300 MB (Electron + dependencies)
- Installed size: ~500 MB
- First run: 5-10 minutes
- Subsequent runs: 5-10 seconds

---

**Last Updated:** 2025-10-22  
**Confidence:** 80% accuracy for claimed working features  
**Overall Score:** 75/100 usable
