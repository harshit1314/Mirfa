# 🎥 Loom Video Walkthrough Guide

**Expected Duration**: 2-3 minutes  
**Key Topics to Cover**:

## Script Outline

### 1. Project Overview (20 seconds)

"Hi, I'm walking through the Mirfa Secure Transactions Mini-App. This is a TurboRepo monorepo with:
- **apps/api** - Fastify backend
- **apps/web** - Next.js frontend  
- **packages/crypto** - Shared encryption library

The app implements envelope encryption using AES-256-GCM for secure transaction storage."

### 2. Project Structure (30 seconds)

Show the directory structure:
```
mirfa/
├── apps/
│   ├── api/        # Fastify backend
│   └── web/        # Next.js frontend
├── packages/
│   └── crypto/     # Encryption library
├── turbo.json      # Monorepo orchestration
└── README.md       # Full documentation
```

Explain:
- "TurboRepo configuration (`turbo.json`) defines build tasks and caching"
- "pnpm workspaces allow packages to reference each other with aliases like `@mirfa/crypto`"
- "Each app is independently deployable but shares encryption logic"

### 3. Encryption Implementation (45 seconds)

Show the encryption code flow:

```typescript
// 1. Generate random DEK (Data Encryption Key)
const dek = generateDEK();  // 32 random bytes

// 2. Encrypt payload with DEK
const encrypted = encrypt(payload, dek);

// 3. Wrap DEK with Master Key
const wrapped = wrapDEK(dek, masterKey);

// 4. Store everything
save({
  payload_nonce, payload_ct, payload_tag,
  dek_wrap_nonce, dek_wrapped, dek_wrap_tag
});
```

Explain:
- "Each transaction gets its own DEK - fast encryption"
- "DEK is wrapped with Master Key - secure key management"
- "Both layers use AES-256-GCM for authenticated encryption"
- "If Master Key rotates, we don't need to re-encrypt payloads"

### 4. Backend API (30 seconds)

Show the Fastify server:

```bash
pnpm dev
# API running on http://localhost:3001
```

Demo the endpoints:
- **POST /tx/encrypt** - Input partyId + JSON → Output encrypted record
- **GET /tx/:id** - Retrieve encrypted record
- **POST /tx/:id/decrypt** - Decrypt and return original payload

Show error handling:
- "Validates nonce length (must be 12 bytes)"
- "Validates tag length (must be 16 bytes)"
- "Catches tampering - if ciphertext/tag is modified, decryption fails"

### 5. Frontend Demo (45 seconds)

Show `http://localhost:3000`:

1. **Encrypt & Store**:
   - Enter partyId: `party_123`
   - Enter JSON: `{"amount": 100, "currency": "AED"}`
   - Click "Encrypt & Save"
   - Copy transaction ID (e.g., `550e8400...`)

2. **Retrieve & Decrypt**:
   - Paste transaction ID
   - Click "Fetch" → Shows encrypted record  
   - Click "Decrypt" → Shows original payload
   - "The decrypted data matches exactly what we encrypted"

### 6. Testing (20 seconds)

```bash
pnpm test
```

Show test coverage:
- ✅ Encrypt → Decrypt roundtrip
- ✅ Tampered ciphertext detection
- ✅ Tampered tag detection  
- ✅ Invalid nonce rejection
- ✅ Invalid tag rejection
- ✅ Multiple payloads isolation

Explain: "These tests ensure the encryption is cryptographically correct and tampering is detected immediately."

### 7. Deployment (30 seconds)

Show the deployment setup:
- "Both API and Web are deployed to Vercel"
- "TurboRepo handles monorepo builds - Vercel automatically detects root `turbo.json`"
- "Environment variables:
  - API: `MASTER_KEY` (hex-encoded 256-bit key)
  - Web: `NEXT_PUBLIC_API_URL` (points to API URL)"
- "End-to-end test: Web makes fetch to API, encryption works across domains"

### 8. Bug We Solved (30 seconds)

**Example bug and fix:**

"Challenge: The authentication tag was being lost when storing as hex.
- Problem: Buffer operations weren't preserving exact byte position
- Solution: Systematically convert all binary values to hex for storage, validate before decryption
- Learning: Hex encoding is safer for JSON storage than base64 alternatives"

### 9. Future Improvements (20 seconds)

"If we had more time:
1. **SQLite/Postgres**: Replace in-memory storage with persistent DB
2. **Master Key Rotation**: Implement key versioning (`mk_version` field)
3. **Audit Logging**: Track all operations per party ID
4. **Rate Limiting**: Prevent abuse per API client
5. **HSM Integration**: Store Master Key in Hardware Security Module"

---

## Filming Tips

✅ **Do**:
- Speak clearly and at normal pace
- Show working code and actual running apps
- Explain the "why" behind decisions
- Demonstrate error handling
- Show test results passing

❌ **Don't**:
- Read code character-by-character
- Rush through explanations
- Assume viewer knows implementation details
- Leave dead air (pause briefly if needed)
- Show secrets/API keys in video (blur if necessary)

## Recording Tools

- **Screen Recording**: 
  - Windows: Built-in Game Bar (Win + G)
  - Mac: QuickTime Player
  - Linux: OBS Studio
  
- **Audio**: Use built-in mic or external USB microphone (much better)

- **Uploading to Loom**:
  - Go to [loom.com](https://loom.com)
  - Click "Record" → "Record your screen"
  - Share link in submission

## Checklist

- [ ] All code is working locally
- [ ] Dependencies installed (`pnpm install`)
- [ ] Tests passing (`pnpm test`)
- [ ] Dev servers running (`pnpm dev`)
- [ ] Frontend is accessible
- [ ] Can encrypt, fetch, decrypt end-to-end
- [ ] Deployment URLs working
- [ ] Audio is clear
- [ ] Screen is readable (good text size)
- [ ] Total time is 2-3 minutes
- [ ] Video is uploaded to Loom
- [ ] Raw file is saved locally as backup
