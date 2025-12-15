# How to Set Up Medusa Admin API Key

## Step 1: Create Secret API Key in Medusa Admin

1. **Open Medusa Admin Panel**
   - Go to: `http://localhost:9000/app` (or your Medusa admin URL)
   - Log in with your admin credentials

2. **Navigate to API Key Management**
   - Click on **Settings** (gear icon in the sidebar)
   - Click on **API Key Management** or **API Keys**

3. **Create a Secret API Key**
   - Click **"Create Secret API Key"** button (NOT Publishable API Key)
   - Give it a name like: `Admin API Key for Custom Checkout`
   - Click **"Create"**

4. **Copy the Key**
   - ⚠️ **IMPORTANT**: Copy the key immediately - you won't be able to see it again!
   - It should look something like: `sk_live_1234567890abcdef...` or `sk_test_...`

## Step 2: Add to Environment Variables

1. **Open your `.env` file**
   - In your `zda-sanity` project root
   - If you don't have a `.env` file, create one

2. **Add the API Key**
   ```env
   MEDUSA_ADMIN_API_KEY=sk_live_1234567890abcdef...
   ```

   **OR** use one of these alternative names (the code supports all of them):
   ```env
   MEDUSA_SECRET_API_KEY=sk_live_1234567890abcdef...
   # OR
   MEDUSA_API_KEY=sk_live_1234567890abcdef...
   ```

3. **Also verify you have the backend URL set:**
   ```env
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
   # OR
   MEDUSA_BACKEND_URL=http://localhost:9000
   ```

## Step 3: Restart Your Dev Server

After adding the environment variable:

```bash
# Stop your dev server (Ctrl+C)
# Then restart it
yarn dev
```

## Step 4: Verify It Works

1. Try checking out a custom cable product
2. Check your server console - you should NOT see the "Admin API key not set" error
3. The order should be created successfully in Medusa Admin

## Troubleshooting

### Error: "Admin API key not set"
- Make sure you added the key to `.env` file (not `.env.local` or `.env.example`)
- Make sure you restarted your dev server after adding it
- Check that the key starts with `sk_` (Secret Key)

### Error: "401 Unauthorized"
- Make sure you copied the **Secret API Key**, not the Publishable API Key
- Secret keys start with `sk_`
- Publishable keys start with `pk_` (these won't work for admin API)

### Error: "Backend URL not set"
- Make sure `NEXT_PUBLIC_MEDUSA_BACKEND_URL` or `MEDUSA_BACKEND_URL` is set in `.env`
- Check that your Medusa backend is running on that URL

## Security Note

⚠️ **Never commit your Secret API Key to git!**

- Make sure `.env` is in your `.gitignore`
- Never share your Secret API Key publicly
- Secret keys have full admin access to your Medusa backend

