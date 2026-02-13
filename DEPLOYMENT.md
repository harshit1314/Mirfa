# 🚀 Deployment Guide

## Prerequisites

- GitHub account with repository
- Vercel account (free tier is sufficient)
- pnpm installed locally

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: Secure Transactions Mini-App"
git push origin main
```

## Step 2: Deploy API to Vercel

### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "monorepo" as the preset
5. Set "Root Directory" to `apps/api`
6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to API directory
cd apps/api

# Deploy
vercel deploy --prod

# Vercel will ask:
# - Scope (select your account)
# - Project name (e.g., mirfa-api)
# - Confirm production deployment
```

### Configure Environment Variables

After deployment, set environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add `MASTER_KEY`: 
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use existing key from secure vault
3. Keep `PORT` and `HOST` as defaults (Vercel handles these)

**Example MASTER_KEY generation:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

## Step 3: Deploy Web to Vercel

### Option A: Using Vercel Dashboard

1. Click "New Project" in Vercel Dashboard
2. Import the same GitHub repository
3. Set "Root Directory" to `apps/web`
4. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-api-project.vercel.app` (use your API URL from Step 2)
5. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Navigate to web directory
cd apps/web

# Deploy
vercel deploy --prod

# After deployment, add environment variable:
# NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
```

## Step 4: Verify Deployment

### Test API Health Check

```bash
curl https://your-api-project.vercel.app/health
# Should return: { "status": "ok" }
```

### Test Encryption Endpoint

```bash
curl -X POST https://your-api-project.vercel.app/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "party_test",
    "payload": {"amount": 100, "currency": "AED"}
  }'
```

### Visit Frontend

Open `https://your-web-project.vercel.app` in browser

Test the complete workflow:
1. Enter partyId
2. Enter JSON payload
3. Click "Encrypt & Save"
4. Copy transaction ID
5. Click "Fetch"
6. Click "Decrypt"
7. Verify original payload matches

## Step 5: Set Up Custom Domain (Optional)

In Vercel Dashboard for each project:

1. Go to Settings → Domains
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed by Vercel

## Troubleshooting

### "Module not found" error

**Cause**: pnpm workspaces not properly installed

**Fix**:
```bash
pnpm install --recursive
pnpm build
```

### API returns 500 error

**Check**:
1. Verify `MASTER_KEY` is set in environment variables
2. Check error logs in Vercel dashboard: Deployments → Logs
3. Ensure `/health` endpoint responds with `{"status":"ok"}`

### Frontend shows "Connection refused"

**Cause**: `NEXT_PUBLIC_API_URL` not set correctly

**Fix**:
1. Check environment variable in Vercel dashboard
2. Must start with `https://` (not http)
3. Verify API is deployed and responding
4. Rebuild frontend after changing environment variable

### CORS errors in browser console

**Cause**: API CORS origin not configured correctly

**Fix**: 
1. Check `@fastify/cors` configuration in `apps/api/src/server.ts`
2. Currently set to `origin: true` (allows all origins)
3. For production, set to specific domain:
   ```typescript
   await app.register(cors, {
     origin: 'https://your-web-project.vercel.app',
   });
   ```

## Production Checklist

- [ ] Master Key stored securely (not in code)
- [ ] `.env.local` not committed to git
- [ ] API endpoint responding to health check
- [ ] Frontend environment variable pointing to correct API
- [ ] CORS configured for your domain
- [ ] HTTPS enforced (Vercel does this by default)
- [ ] Both projects deployed to production
- [ ] End-to-end test: encrypt → fetch → decrypt
- [ ] Record Loom video walkthrough
- [ ] Submit with URLs and video

## Monitoring

### Check Deployment Status

```bash
vercel ls  # List all deployments
vercel status  # Check current deployment status
```

### View Logs

```bash
vercel logs <project-name>  # Stream logs
vercel logs <project-name> --follow  # Continuous monitoring
```

### Set Up Error Alerts

In Vercel Dashboard → Project Settings → Analytics Engine (if applicable)

## URLs to Submit

After successful deployment, you'll have:

- **API URL**: `https://your-api-project.vercel.app`
- **Web URL**: `https://your-web-project.vercel.app`

Include these in your submission along with the Loom video.

## Rollback

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "Redeploy" button
4. Previous version is immediately live

---

**Deployment Time**: ~2-3 minutes after git push  
**Rebuilds Automatically**: On every push to main branch
