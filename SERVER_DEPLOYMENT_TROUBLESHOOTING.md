# Server Deployment Troubleshooting Guide

## Issue: Frontend on Server Can't Fetch Regions from Backend

If your localhost frontend works but server-deployed frontend shows "No regions found", this is typically a **CORS or network connectivity issue**.

## Quick Checks

### 1. Verify Environment Variables on Server

SSH into your server and check:
```bash
cd ~/front/zda-store
cat .env.local
```

Ensure these are set correctly:
```env
MEDUSA_BACKEND_URL=http://18.191.243.236:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
```

### 2. Test Backend Connectivity from Server

From your server, test if the backend is accessible:
```bash
curl -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY" http://18.191.243.236:9000/store/regions
```

If this fails, the backend is not accessible from your frontend server.

### 3. Check Backend CORS Configuration

Your Medusa backend needs to allow requests from your frontend server. Check `backend/medusa-config.ts`:

```typescript
module.exports = defineConfig({
  projectConfig: {
    // ...
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://your-frontend-domain.com",
      // ...
    }
  }
})
```

**Important:** Add your frontend server's domain/IP to `STORE_CORS`:
- If frontend is on same server: `http://localhost:8000`
- If frontend is on different server: `http://frontend-ip:8000` or `http://your-domain.com`
- For production: `https://your-domain.com`

### 4. Check Firewall/Security Groups

Ensure:
- Port 9000 (backend) is open and accessible from your frontend server
- If using AWS/Azure/GCP, check security groups allow traffic between frontend and backend servers

### 5. Verify Backend is Running

On your backend server:
```bash
# Check if backend is running
pm2 list
# or
ps aux | grep medusa

# Check backend logs
pm2 logs Backend
```

### 6. Test Direct API Call

From your frontend server, test the regions endpoint:
```bash
curl -v http://18.191.243.236:9000/store/regions \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY"
```

Look for:
- `200 OK` response = Backend is accessible
- `CORS` errors = CORS not configured correctly
- `Connection refused` = Backend not running or firewall blocking
- `404 Not Found` = Wrong URL or backend route doesn't exist

## Common Solutions

### Solution 1: Fix CORS on Backend

1. Edit `backend/medusa-config.ts`:
```typescript
storeCors: process.env.STORE_CORS || "http://localhost:8000,http://18.191.243.236:8000,http://your-frontend-domain.com"
```

2. Set `STORE_CORS` in backend `.env`:
```env
STORE_CORS=http://localhost:8000,http://18.191.243.236:8000,http://your-frontend-domain.com
```

3. Restart backend:
```bash
pm2 restart Backend
```

### Solution 2: Use Same Server for Frontend and Backend

If both are on the same server, use `localhost`:
```env
MEDUSA_BACKEND_URL=http://localhost:9000
```

### Solution 3: Use Domain Instead of IP

If possible, use a domain name instead of IP:
```env
MEDUSA_BACKEND_URL=http://backend.yourdomain.com:9000
```

Then configure CORS with the domain:
```env
STORE_CORS=http://frontend.yourdomain.com,http://yourdomain.com
```

### Solution 4: Check Network Connectivity

If frontend and backend are on different servers:
1. Ensure they can reach each other (ping, telnet)
2. Check firewall rules
3. Verify security groups (AWS/Azure/GCP)

## Debugging Steps

1. **Check frontend server logs:**
   ```bash
   pm2 logs FrontEnd --lines 50
   ```
   Look for CORS errors or connection refused errors.

2. **Check backend logs:**
   ```bash
   pm2 logs Backend --lines 50
   ```
   Look for incoming requests and CORS errors.

3. **Test from frontend server:**
   ```bash
   # Test regions endpoint
   curl -H "x-publishable-api-key: YOUR_KEY" http://18.191.243.236:9000/store/regions
   
   # Test products endpoint
   curl -H "x-publishable-api-key: YOUR_KEY" "http://18.191.243.236:9000/store/products?limit=1"
   ```

4. **Check environment variables are loaded:**
   ```bash
   # On frontend server
   cd ~/front/zda-store
   node -e "require('dotenv').config({path: '.env.local'}); console.log(process.env.MEDUSA_BACKEND_URL)"
   ```

## Expected Behavior

After fixing CORS:
- Frontend server can fetch regions from backend
- Products load correctly
- No "No regions found" errors in logs

## Still Having Issues?

1. Check backend `medusa-config.ts` CORS settings
2. Verify `STORE_CORS` environment variable on backend
3. Test backend API directly with curl
4. Check firewall/security group rules
5. Verify both servers can communicate (ping, telnet)

