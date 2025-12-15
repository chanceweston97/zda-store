# Fix Database Connection for Production Deployment

## Problem
Your production deployment is trying to connect to Supabase using a direct connection URL (port 5432), which doesn't work in serverless environments like Vercel.

## Solution

### Step 1: Get the Connection Pooler URL from Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **"Transaction"** mode (this is important for serverless)
6. Copy the **Connection Pooler URL** (it will look like):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **Important:** Notice it uses port **6543** (not 5432) and includes `pooler.supabase.com`

### Step 2: Update Environment Variables in Your Hosting Platform

#### For Vercel:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `DATABASE_URL` or create it if it doesn't exist
4. Replace the value with your **Connection Pooler URL** (from Step 1)
5. Make sure it's set for **Production**, **Preview**, and **Development** environments
6. Redeploy your application

#### For Other Platforms:
Update the `DATABASE_URL` environment variable in your hosting platform's settings with the Connection Pooler URL.

### Step 3: Verify Your Database is Active

1. In Supabase Dashboard, go to **Project Settings** → **General**
2. Make sure your project status is **Active** (not paused)
3. Supabase free tier projects pause after inactivity - if paused, click "Restore" to wake it up

### Step 4: Check Network Restrictions (if still failing)

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Scroll to **Network restrictions**
3. For serverless deployments, you may need to:
   - Allow connections from anywhere (0.0.0.0/0) temporarily, OR
   - Add your hosting platform's IP ranges

### Step 5: Test the Connection

After updating the environment variable and redeploying:
1. Try subscribing to the newsletter again
2. Check the admin panel to see if subscribers are loading
3. Check your hosting platform's logs for any connection errors

## Key Differences

**Direct Connection (doesn't work in serverless):**
```
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

**Connection Pooler (required for serverless):**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Additional Notes

- The connection pooler URL is specifically designed for serverless/server environments
- It uses port **6543** instead of **5432**
- It includes `pooler.supabase.com` in the hostname
- The `?pgbouncer=true` parameter helps with connection pooling

## If Issues Persist

1. **Check Supabase project status** - Make sure it's not paused
2. **Verify the connection string format** - Should include `pooler.supabase.com` and port `6543`
3. **Check environment variables** - Make sure `DATABASE_URL` is set correctly in production
4. **Review logs** - Check your hosting platform's logs for detailed error messages
5. **Test locally** - Try using the pooler URL in your local `.env` file to verify it works

