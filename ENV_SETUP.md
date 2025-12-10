# Environment Variables Setup for Server Backend

## Required Environment Variables

To connect your frontend to a server backend, you need to set these environment variables:

### 1. Backend URL
```bash
MEDUSA_BACKEND_URL=http://your-server-ip:port
```

**Example:**
```bash
MEDUSA_BACKEND_URL=http://18.191.243.236:9000
```

### 2. Publishable API Key
```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
```

## Setup Instructions

### For Local Development (Windows/Mac)
1. Create or edit `.env.local` in the `front` directory
2. Add the variables:
   ```
   MEDUSA_BACKEND_URL=http://your-server-ip:9000
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
   ```
3. Restart your dev server: `npm run dev` or `yarn dev`

### For Server Deployment (Linux/Ubuntu)
1. Create or edit `.env` or `.env.local` in the `front` directory
2. Add the variables:
   ```
   MEDUSA_BACKEND_URL=http://your-server-ip:9000
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
   ```
3. Restart your application

### Important Notes:
- `MEDUSA_BACKEND_URL` - Points to your Medusa backend server (no `NEXT_PUBLIC_` prefix)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` - Must have `NEXT_PUBLIC_` prefix to be accessible in the browser
- Make sure your backend server is accessible from where your frontend is running
- If using HTTPS, use `https://` instead of `http://`
- Ensure CORS is properly configured on your backend to allow requests from your frontend domain

### Verify Your Setup
Run this command to verify your environment variables are set:
```bash
node verify-env.js
```

