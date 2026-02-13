# 🚀 Quick Start Guide

Get the Mirfa Secure Transactions app running locally in 5 minutes.

## Prerequisites

- **Node.js 20+** - Check with `node --version`
- **pnpm 9+** - Install with `npm install -g pnpm`
- **Git** - For version control
- **VS Code** (optional) - For development

## Installation (2 minutes)

```bash
# Navigate to project directory
cd /path/to/mirfa

# Install all dependencies across the monorepo
pnpm install

# Build all packages
pnpm build

# Expected output:
# ✅ @mirfa/crypto built
# ✅ @mirfa/api built
# ✅ @mirfa/web built
```

## Development Mode (1 minute)

```bash
# Start all dev servers with live reload
pnpm dev

# Watch for this output:
# ✅ API running at http://localhost:3001
# ✅ Web running at http://localhost:3000
```

**Keep the terminal running** (both servers run in foreground)

## Testing (1 minute)

Open **new terminal** and run:

```bash
pnpm test

# Expected: All 13 tests pass ✅
# Tests verify encryption, tamper detection, validation
```

## Manual Testing (Interactive)

### Test 1: Encrypt & Decrypt Flow

1. Open browser: http://localhost:3000
2. Fill in form:
   - Party ID: `testuser_001`
   - JSON Payload:
     ```json
     {
       "transaction": "payment",
       "amount": 500,
       "currency": "USD"
     }
     ```
3. Click "🔒 Encrypt & Save"
4. See success message with Transaction ID
5. Copy the ID (e.g., `550e8400-e29b-41d4...`)
6. Paste ID into "Transaction ID" field
7. Click "📥 Fetch" → See encrypted record
8. Click "🔓 Decrypt" → See original JSON

### Test 2: Error Handling

1. Enter fake Transaction ID: `invalid-id-12345`
2. Click "📥 Fetch"
3. See error: "❌ Error: Transaction record not found"

### Test 3: Multiple Transactions

1. Encrypt transaction 1 with amount 100
2. Encrypt transaction 2 with amount 200
3. Fetch transaction 1 → Should decrypt to 100
4. Fetch transaction 2 → Should decrypt to 200
5. Verify they don't interfere (independent DEKs)

## File Structure When Running

```
mirfa/
├── apps/
│   ├── api/
│   │   ├── dist/           ← Built JavaScript
│   │   ├── src/
│   │   └── package.json
│   └── web/
│       ├── .next/          ← Next.js build cache
│       ├── app/
│       └── package.json
├── packages/
│   └── crypto/
│       ├── dist/           ← Built encryption library
│       └── src/
└── node_modules/           ← All dependencies
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Run development servers (both)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Run cryptography tests only
pnpm -F @mirfa/crypto test

# Run API only
cd apps/api && pnpm dev

# Run Web only
cd apps/web && pnpm dev

# Clean all build artifacts
pnpm exec rm -rf $(find . -name dist -o -name .next)

# Fresh install (if dependencies corrupted)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Environment Variables

No `.env` files needed for local development. Defaults are:
- API Port: `3001`
- Web Port: `3000`
- API URL (from web): `http://localhost:3001`
- Master Key: Auto-generated on startup

## Troubleshooting

### Port Already in Use

If you see `Error: listen EADDRINUSE`:

```bash
# Kill process on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3001
kill -9 <PID>
```

### Module Not Found

```bash
# Reinstall dependencies
pnpm install

# Verify workspaces
pnpm ls

# Should show @mirfa/crypto, @mirfa/api, @mirfa/web linked
```

### Tests Fail

```bash
# Make sure crypto built successfully
pnpm -F @mirfa/crypto build

# Then run tests
pnpm test
```

### Frontend Shows "Cannot Connect to API"

1. Check API is running: `curl http://localhost:3001/health`
2. Should respond with `{"status":"ok"}`
3. If not, restart API server

## Next Steps

✅ Verify everything works locally  
✅ Read IMPLEMENTATION_NOTES.md for architecture details  
✅ Review DEPLOYMENT.md for production setup  
✅ Create Loom video (3 minutes)  
✅ Deploy to Vercel (follow DEPLOYMENT.md)  
✅ Submit with URLs + video  

---

**Expected setup time**: 5 minutes  
**Typical flow**: Install → Dev → Test → Deploy
