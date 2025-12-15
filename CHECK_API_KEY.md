# How to Check if Your API Key is Working

## Quick Test

1. **Check your .env file**:
   ```bash
   # In zda-sanity folder
   cat .env | grep MEDUSA_ADMIN_API_KEY
   ```
   
   Should show:
   ```
   MEDUSA_ADMIN_API_KEY=sk_live_xxxxx...
   ```

2. **Test the API key with curl**:
   ```bash
   # Replace YOUR_KEY with your actual key
   curl -X GET http://localhost:9000/admin/products \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json"
   ```
   
   If you get products back → API key works ✅
   If you get 401 → API key is wrong ❌

3. **Check server console logs**:
   - Look for: `[Custom Checkout] Using API key:`
   - Should show: `keyPrefix: "sk_live_xxx..."` and `startsWithSk: true`

## Common Issues

### Issue 1: API Key Not in .env
- Make sure it's in `.env` (not `.env.local` or `.env.example`)
- Make sure there's no space around the `=` sign
- Example: `MEDUSA_ADMIN_API_KEY=sk_live_123456` ✅
- NOT: `MEDUSA_ADMIN_API_KEY = sk_live_123456` ❌ (space around =)

### Issue 2: Wrong Type of Key
- Must be **Secret API Key** (starts with `sk_`)
- NOT Publishable Key (starts with `pk_`)
- Go to Admin → Settings → **Secret API Keys** (not Publishable API Keys)

### Issue 3: Server Not Restarted
- After adding to .env, you MUST restart:
  ```bash
  # Stop server (Ctrl+C)
  yarn dev
  ```

### Issue 4: API Key Copied Incorrectly
- Make sure you copied the ENTIRE key
- No extra spaces at beginning or end
- Key should be quite long (50+ characters)

### Issue 5: Backend URL Wrong
- Check your `.env` has:
  ```env
  NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
  ```
- Or:
  ```env
  MEDUSA_BACKEND_URL=http://localhost:9000
  ```

