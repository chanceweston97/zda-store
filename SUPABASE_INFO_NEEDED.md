# Information Needed from Supabase Account

To fix the database connection and set up the newsletter subscription, I need the following information from your Supabase dashboard:

## 1. Database Connection String

**Where to find it:**
- Go to: https://supabase.com/dashboard
- Select your project
- Go to **Settings** → **Database**
- Scroll to **Connection string** section

**What I need:**
- **Connection Pooler URL** (recommended for production)
  - Select **"Transaction"** mode
  - Copy the connection string (it will look like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)
  
  OR
  
- **Direct Connection URL** (for development)
  - Copy the connection string (it will look like: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`)

## 2. Database Password

**Where to find it:**
- Go to: **Settings** → **Database**
- Look for **Database password** section
- If you don't remember it, you can reset it (but this will require updating all connection strings)

## 3. Connection Pooling Settings

**Where to find it:**
- Go to: **Settings** → **Database**
- Check **Connection Pooling** section
- Make sure it's enabled
- Note the pooler mode (Transaction or Session)

## 4. IP Allowlist (if connection fails)

**Where to find it:**
- Go to: **Settings** → **Database**
- Scroll to **Connection string** → **Network restrictions**
- Check if your IP is allowed
- For development, you might need to allow all IPs temporarily

## 5. Database Status

**Where to check:**
- Go to: **Project Settings** → **General**
- Check if the project is **Active** (not paused)
- Supabase free tier projects pause after inactivity

---

## What to Do:

1. **Copy the Connection Pooler URL** (Transaction mode) - this is the most reliable
2. **Update your `.env` file** with:
   ```
   DATABASE_URL=your_connection_pooler_url_here
   ```
3. **Make sure your project is Active** (not paused)
4. **Check IP restrictions** if connection still fails

## After Getting the Info:

Once you have the connection string, I can help you:
- Update the `.env` file
- Test the connection
- Run the Prisma migration to add the Newsletter table
- Verify the newsletter subscription form works

---

**Note:** Never share your actual database password or full connection string publicly. You can share just the format/structure if needed for troubleshooting.

