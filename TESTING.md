# 🧪 Comprehensive Testing Guide

This guide provides detailed test scenarios to verify all functionality works correctly.

## Prerequisites

```bash
# Start with clean state
pnpm install
pnpm build

# Terminal 1: Start dev servers
pnpm dev

# Terminal 2: Run tests (after servers start)
pnpm test
```

## Automated Test Results (vitest)

Run `pnpm test` - should see:

```
✓ encryption.test.ts (13 tests)
  ✓ should encrypt and decrypt a plaintext string
  ✓ should reject tampered ciphertext
  ✓ should reject tampered tag
  ✓ should reject invalid nonce length
  ✓ should reject invalid tag length
  ✓ should validate nonce length correctly
  ✓ should validate tag length correctly
  ✓ should validate hex strings
  ✓ should wrap and unwrap DEK correctly
  ✓ should encrypt and decrypt a complete transaction
  ✓ should detect tampering in wrapped DEK
  ✓ should detect tampering in payload ciphertext
  ✓ should handle multiple different payloads

Tests: 13 passed
```

## Manual Integration Tests

### Test Suite 1: Basic Workflow

#### Test 1.1: Encrypt and Retrieve

**Scenario**: Encrypt a transaction, retrieve it encrypted, then decrypt

**Steps**:
```
1. Open http://localhost:3000
2. Party ID: "business_001"
3. Payload: {"invoice": 12345, "amount": 1000.50}
4. Click "🔒 Encrypt & Save"
   Expected: ✅ Encrypted & Saved! Transaction ID: [id]
5. Copy transaction ID
6. Paste into "Transaction ID" field
7. Click "📥 Fetch"
   Expected: Shows encrypted record with all fields
8. Click "🔓 Decrypt"
   Expected: Shows original JSON exactly
```

**Verification**:
- ✅ No errors in console
- ✅ Encrypted record has these fields:
  - `id`, `partyId`, `createdAt`
  - `payload_nonce`, `payload_ct`, `payload_tag`
  - `dek_wrap_nonce`, `dek_wrapped`, `dek_wrap_tag`
  - `alg: "AES-256-GCM"`, `mk_version: 1`
- ✅ Decrypted payload matches exactly

#### Test 1.2: Different Payload Types

**Scenario**: Ensure different JSON structures encrypt correctly

**Steps**:
```
Test with:

1. Simple object:
   {"name": "John", "age": 30}

2. Nested object:
   {"user": {"id": 1, "profile": {"email": "test@example.com"}}}

3. Array:
   {"items": [1, 2, 3]}

4. Numbers and booleans:
   {"active": true, "count": 0, "price": 99.99}

5. Empty object:
   {}

6. Unicode characters:
   {"name": "日本語 🔐", "emoji": "🚀"}
```

For each: Encrypt → Fetch → Decrypt → Verify output matches input exactly

**Verification**:
- ✅ All payload types encrypt/decrypt correctly
- ✅ Special characters preserved
- ✅ Unicode handled properly

### Test Suite 2: Error Handling

#### Test 2.1: Invalid Transaction ID

**Scenario**: Try to fetch non-existent transaction

**Steps**:
```
1. Enter ID: "00000000-0000-0000-0000-000000000000"
2. Click "📥 Fetch"
   Expected Error: ❌ Error: Transaction record not found
3. Try another ID: "invalid-uuid"
4. Click "📥 Fetch"
   Expected Error: ❌ Error: Transaction record not found
```

**Verification**:
- ✅ Error message is clear
- ✅ API returns 404 status
- ✅ Frontend displays error without crashing

#### Test 2.2: Invalid JSON Input

**Scenario**: Try to encrypt invalid JSON

**Steps**:
```
1. Payload field: {invalid json]
2. Click "🔒 Encrypt & Save"
   Expected Error: ❌ Error: [JSON parse error message]
```

**Verification**:
- ✅ Caught before sending to API
- ✅ Clear error message

#### Test 2.3: Missing partyId

**Scenario**: Try to encrypt with empty partyId

**Steps**:
```
1. Clear party ID field
2. Click "🔒 Encrypt & Save"
   Expected: Either shows error OR uses empty string
```

**Verification**:
- ✅ Handles gracefully (either validation or allows empty string)

### Test Suite 3: API Endpoint Testing

Use `curl` or Postman to directly test API.

#### Test 3.1: POST /tx/encrypt

```bash
curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "api_test_001",
    "payload": {"test": true, "value": 42}
  }'

# Expected 201 response:
{
  "id": "550e8400-...",
  "partyId": "api_test_001",
  "createdAt": "2024-02-20T10:00:00.000Z",
  "payload_nonce": "...",
  "payload_ct": "...",
  ...
}
```

**Verification**:
- ✅ Status code is 201 (Created)
- ✅ Response has all required fields
- ✅ `id` is valid UUID v4
- ✅ `alg` is "AES-256-GCM"
- ✅ `mk_version` is 1

#### Test 3.2: GET /tx/:id

```bash
# Using transaction ID from previous test
TXID="550e8400-..."

curl http://localhost:3001/tx/${TXID}

# Expected 200 response: same structure as encrypt
```

**Verification**:
- ✅ Status code is 200
- ✅ Retrieved record matches created record
- ✅ No decryption happened (still encrypted)

#### Test 3.3: POST /tx/:id/decrypt

```bash
curl -X POST http://localhost:3001/tx/${TXID}/decrypt

# Expected 200 response:
{
  "payload": {
    "test": true,
    "value": 42
  }
}
```

**Verification**:
- ✅ Status code is 200
- ✅ Payload matches original input
- ✅ JSON structure preserved exactly

#### Test 3.4: GET /health

```bash
curl http://localhost:3001/health

# Expected:
{ "status": "ok" }
```

**Verification**:
- ✅ Responds immediately
- ✅ Status code 200

### Test Suite 4: Security & Tampering

#### Test 4.1: Detect Ciphertext Tampering

**Method 1: Direct API manipulation**

```bash
# Encrypt
TX=$(curl -s -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"tamper_test","payload":{"secret":"data"}}')

TXID=$(echo $TX | jq -r '.id')

# Get the encrypted record
RECORD=$(curl -s http://localhost:3001/tx/$TXID)

# Manually tamper with payload_ct
TAMPERED_CT="cafebabe$(echo $RECORD | jq -r '.payload_ct' | cut -c 9-)"

# Try to decrypt (would require modifying the record in-memory - skip for now)
```

**Method 2: Frontend manipulation**

```
1. Encrypt: {"secret": "data"}
   Get: payload_ct = "a1b2c3d4..."
2. Copy encrypted record JSON
3. Edit: Change first char of payload_ct to "d" (e.g., "d1b2c3d4...")
4. Use developer tools to inject modified record
5. Attempt to decrypt
6. Expected: ❌ Error: AUTHENTICATION_FAILED
```

**Verification**:
- ✅ Tampered ciphertext rejected
- ✅ Cannot decrypt modified data
- ✅ Authentication tag checked before plaintext

#### Test 4.2: Detect Tag Tampering

```
Similar to 4.1 but modify payload_tag instead of payload_ct
Expected: Same failure (AUTHENTICATION_FAILED)
```

**Verification**:
- ✅ Modified tag rejected
- ✅ Cannot forge valid ciphertext without correct tag

#### Test 4.3: Prevent Invalid Nonce

```bash
# Create record with manually corrupted nonce
# This would require backend modification to test
# Skip in manual test

# Verify via automated tests: pnpm test
```

### Test Suite 5: Performance & Scale

#### Test 5.1: Multiple Concurrent Transactions

```bash
# Encrypt 5 transactions in rapid succession
for i in {1..5}; do
  curl -s -X POST http://localhost:3001/tx/encrypt \
    -H "Content-Type: application/json" \
    -d "{\"partyId\":\"perf_test_$i\",\"payload\":{\"index\":$i}}" &
done
wait

# Expected: All 5 succeed, no errors
```

**Verification**:
- ✅ All transactions created
- ✅ No race conditions
- ✅ Each has unique ID and DEK

#### Test 5.2: Large Payload

```bash
# Create large JSON (~100KB)
LARGE_JSON='{
  "data": "'$(head -c 100000 </dev/urandom | xxd -p)'",
  "size": 100000
}'

curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d "{\"partyId\":\"large_test\",\"payload\":$LARGE_JSON}"

# Should still work (may take a few ms longer)
```

**Verification**:
- ✅ Large payloads can be encrypted
- ✅ Decryption succeeds
- ✅ No memory issues

### Test Suite 6: CORS & Cross-Origin

#### Test 6.1: CORS Headers Present

```bash
curl -i -X OPTIONS http://localhost:3001/tx/encrypt \
  -H "Origin: http://localhost:3000"

# Look for headers:
# Access-Control-Allow-Origin: http://localhost:3000 (or *)
# Access-Control-Allow-Methods: *
```

**Verification**:
- ✅ CORS headers present
- ✅ Frontend can make requests to API

### Test Suite 7: Data Types & Edge Cases

#### Test 7.1: Null and Empty Values

```javascript
// In browser console
fetch('http://localhost:3001/tx/encrypt', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    partyId: 'edge_case_1',
    payload: {
      null_value: null,
      empty_string: '',
      zero: 0,
      false_bool: false
    }
  })
})
.then(r => r.json())
.then(console.log)
```

**Verification**:
- ✅ null, empty string, 0, false preserved
- ✅ Decrypted payload has exact same types

#### Test 7.2: Decimal Precision

```javascript
{
  partyId: 'precision_test',
  payload: {
    pi: 3.14159265358979,
    large_number: 9007199254740991,
    small_number: 0.00001
  }
}
```

**Verification**:
- ✅ Numbers maintain precision through encrypt/decrypt
- ✅ JSON serialization/deserialization handled correctly

## Test Results Checklist

After running all tests:

- [ ] Automated tests pass: `pnpm test` (13/13 ✅)
- [ ] Basic workflow works (encrypt → fetch → decrypt)
- [ ] Error handling graceful
- [ ] Tampering detected
- [ ] API endpoints respond correctly
- [ ] CORS headers present
- [ ] Multiple transactions don't interfere
- [ ] Large payloads handled
- [ ] Edge cases (null, empty, precision) work
- [ ] Frontend UI updates correctly
- [ ] Console shows no errors

## Performance Benchmarks

After all tests pass, validate performance:

```bash
# Time 100 encrypt operations
time for i in {1..100}; do
  curl -s -X POST http://localhost:3001/tx/encrypt \
    -H "Content-Type: application/json" \
    -d '{"partyId":"bench","payload":{"n":'$i'}}' > /dev/null
done

# Expected: ~100-500ms total (1-5ms per operation)
```

## Debugging Tips

### Check API Logs

```bash
# Terminal running pnpm dev will show:
# [timestamp] [api] POST /tx/encrypt 201 2ms
# [timestamp] [web] GET / 200 45ms
```

### Check Browser Console

```
Open http://localhost:3000 → F12 → Console

Should see:
- Network requests to API
- No errors (green console icon)
- Encryption/decryption responses
```

### Inspect Network Tab

```
F12 → Network → Make request

Check:
- Request headers (Content-Type, etc.)
- Response status (201 for encrypt, 200 for get)
- Response payload (full encrypted record)
```

## Final Validation

When all tests pass ✅:

1. Record Loom video (2-3 minutes)
   - Show this testing process
   - Explain encryption flow
   - Demonstrate end-to-end

2. Deploy to Vercel (DEPLOYMENT.md)
   - API → Vercel
   - Web → Vercel
   - Get production URLs

3. Test production URLs
   - Web UI works
   - API responds
   - End-to-end encrypt/decrypt works

4. Submit:
   - GitHub repo link
   - API URL
   - Web URL
   - Loom video link

---

**Total test time**: ~15-20 minutes  
**Pass rate target**: 100%  
**Status**: Ready to submit when all pass ✅
