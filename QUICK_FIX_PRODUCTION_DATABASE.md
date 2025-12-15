# Quick Fix: Production Database Connection

## The Problem
Your production site is using a **direct database connection** (port 5432) which doesn't work in serverless environments like Vercel. You need to switch to the **connection pooler** (port 6543).

## Quick Fix (5 minutes)

### Step 1: Get Your Connection Pooler URL

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Make sure **"Transaction"** mode is selected
6. Copy the **Connection Pooler URL**

   It should look like this:
   ```
   postgresql://postgres.XXXXX:YYYYY@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **Key indicators it's the pooler:**
   - Contains `pooler.supabase.com`
   - Port is **6543** (not 5432)
   - May include `?pgbouncer=true`

### Step 2: Update Environment Variable in Your Hosting Platform

#### If using Vercel:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` in the list
5. Click **Edit** (or **Add** if it doesn't exist)
6. **Paste the Connection Pooler URL** from Step 1
7. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development (optional, but recommended)
8. Click **Save**
9. **Redeploy** your application (go to Deployments → click the 3 dots → Redeploy)

#### If using other platforms:
- Find where environment variables are configured
- Update `DATABASE_URL` with the pooler URL
- Redeploy/restart your application

### Step 3: Verify Your Supabase Project is Active

1. In Supabase Dashboard → **Project Settings** → **General**
2. Check if status shows **"Active"**
3. If it shows **"Paused"**, click **"Restore"** to wake it up

### Step 4: Test

After redeploying:
1. Try subscribing to the newsletter on your production site
2. Check if it works without errors
3. Check your admin panel to see if subscribers appear

## How to Verify You're Using the Right URL

**❌ Wrong (Direct Connection - doesn't work in production):**
```
postgresql://postgres:password@db.XXXXX.supabase.co:5432/postgres
```
- Contains `db.` (not `pooler.`)
- Port is **5432**

**✅ Correct (Connection Pooler - required for production):**
```
postgresql://postgres.XXXXX:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Contains `pooler.supabase.com`
- Port is **6543**

## Still Not Working?

1. **Check Supabase project status** - Make sure it's not paused
2. **Verify the URL format** - Should have `pooler.supabase.com` and port `6543`
3. **Check environment variables** - Make sure `DATABASE_URL` is set in production environment
4. **Redeploy** - Environment variable changes require a redeploy
5. **Check logs** - Look at your hosting platform's logs for detailed error messages

## Why This Happens

- **Local development**: Direct connection (port 5432) works fine
- **Production/Serverless**: Needs connection pooler (port 6543) because:
  - Serverless functions have connection limits
  - Pooler manages connections efficiently
  - Direct connections can timeout or fail

The error message you're seeing is the code detecting this issue and telling you exactly what to fix!

