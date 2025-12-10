# Troubleshooting 400 Bad Request Error

## Issue
Getting `400 Bad Request` when trying to fetch products/regions from Medusa backend, even though `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set in `.env.local`.

## Common Causes & Solutions

### 1. Environment Variable Not Loaded

**Problem:** Next.js doesn't automatically reload environment variables. You need to restart the dev server.

**Solution:**
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
cd front
npm run dev
# or
yarn dev
```

**Verify it's loaded:**
```bash
cd front
node verify-env.js
```

### 2. Wrong File Name or Location

**Problem:** Environment variables must be in `.env.local` (not `.env`) and in the `front/` directory.

**Solution:**
- Create/check `front/.env.local` (not `front/.env`)
- Make sure it's in the `front/` directory (same level as `package.json`)
- File should contain:
  ```env
  MEDUSA_BACKEND_URL=http://localhost:9000
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your-actual-key-here
  ```

### 3. Publishable Key Not Linked to Sales Channel

**Problem:** The publishable API key exists but isn't linked to a sales channel.

**Solution:**
1. Go to Medusa Admin → Settings → API Keys
2. Find your publishable key
3. Click on it to edit
4. Make sure it's linked to at least one Sales Channel
5. If no sales channel exists, create one first:
   - Go to Settings → Sales Channels
   - Create a sales channel (e.g., "Default Store")
   - Then link it to your API key

### 4. Invalid or Wrong Key Format

**Problem:** The key might be incorrect or from a different environment.

**Solution:**
1. Go to Medusa Admin → Settings → API Keys
2. Find the publishable key
3. Click "Reveal" to see the full key
4. Copy it exactly (no extra spaces)
5. Update `.env.local`:
   ```env
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxxxxxx
   ```
6. Restart the dev server

### 5. Backend Not Running or Wrong URL

**Problem:** Backend might not be running or URL is incorrect.

**Solution:**
1. Check if backend is running:
   ```bash
   # In backend directory
   npm run dev
   # Should see: "Server is ready on port: 9000"
   ```

2. Verify the URL in `.env.local`:
   ```env
   MEDUSA_BACKEND_URL=http://localhost:9000
   ```

3. Test backend directly:
   ```bash
   curl http://localhost:9000/health
   # Should return: {"status":"ok"}
   ```

### 6. CORS Issues

**Problem:** Backend might be blocking requests due to CORS.

**Solution:**
1. Check `backend/medusa-config.ts`:
   ```typescript
   storeCors: process.env.STORE_CORS!,
   ```

2. Set `STORE_CORS` in backend `.env`:
   ```env
   STORE_CORS=http://localhost:8000,http://localhost:3000
   ```

3. Restart backend server

## Step-by-Step Debugging

### Step 1: Verify Environment Variables
```bash
cd front
node verify-env.js
```

### Step 2: Check Browser Console
1. Open your store page in browser
2. Open Developer Tools (F12)
3. Check Console tab for errors
4. Look for: `❌ Middleware: Failed to fetch regions:`

### Step 3: Check Network Tab
1. Open Developer Tools → Network tab
2. Refresh the page
3. Look for requests to `/store/regions` or `/store/products`
4. Click on the failed request
5. Check:
   - **Request Headers:** Is `x-publishable-api-key` present?
   - **Response:** What's the error message?

### Step 4: Test Backend Directly
```bash
# Replace YOUR_KEY with your actual publishable key
curl -H "x-publishable-api-key: YOUR_KEY" http://localhost:9000/store/regions
```

If this works, the issue is with the frontend. If it fails, the issue is with the backend/key configuration.

## Quick Checklist

- [ ] `.env.local` exists in `front/` directory
- [ ] `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set in `.env.local`
- [ ] `MEDUSA_BACKEND_URL` is set in `.env.local`
- [ ] Dev server was restarted after adding env vars
- [ ] Backend is running on port 9000
- [ ] Publishable key exists in Medusa Admin
- [ ] Publishable key is linked to a sales channel
- [ ] Key is copied correctly (no extra spaces)

## Still Not Working?

1. **Check backend logs:**
   - Look at the terminal where backend is running
   - Check for any error messages about API keys

2. **Create a new publishable key:**
   - Go to Medusa Admin → Settings → API Keys
   - Create a new "Publishable" key
   - Link it to your sales channel
   - Update `.env.local` with the new key
   - Restart frontend dev server

3. **Verify key format:**
   - Publishable keys should start with `pk_`
   - They're usually long strings (40+ characters)
   - Make sure you copied the entire key

## Related Files

- `front/src/middleware.ts` - Fetches regions (where error might occur)
- `front/src/lib/data/products.ts` - Fetches products
- `front/src/lib/data/cookies.ts` - Sets headers with publishable key
- `front/src/lib/config.ts` - SDK configuration



