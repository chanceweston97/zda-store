# API Key 401 Error - Troubleshooting Guide

## The Problem

You're getting 401 Unauthorized even though:
- ✅ API key format is correct (`sk_...`)
- ✅ Key is in `.env` file
- ✅ Server is restarted
- ✅ Backend URL is correct

## Why This Happens in Medusa v2

In Medusa v2, Secret API Keys might require:
1. **User Association** - The API key must be associated with a user account
2. **Proper Scopes** - The key needs specific permissions
3. **Different Authentication** - Medusa v2 might use session-based auth instead

## Solutions to Try

### Solution 1: Verify API Key in Admin

1. Go to Medusa Admin → Settings → Secret API Keys
2. Check if your key is listed
3. Check if it's **Active** (not revoked)
4. Try creating a **new** Secret API Key
5. Copy the new key and update your `.env`

### Solution 2: Check API Key Permissions

Some Medusa setups require API keys to have specific scopes. Check:
- Can the key access Admin API?
- Are there any restrictions on the key?

### Solution 3: Alternative Approach - Use Medusa JS SDK

Instead of direct API calls, we might need to use the Medusa JS SDK which handles authentication differently.

### Solution 4: Check if Order Creation is Supported

Medusa v2 might not support direct order creation via `POST /admin/orders`. Orders are typically created through:
- Cart completion workflow
- Draft orders
- Different endpoints

## Next Steps

Given the 401 errors, we have two options:

### Option A: Fix Authentication (if possible)
- Verify API key setup in Medusa Admin
- Try creating a new API key
- Check Medusa documentation for v2 API key requirements

### Option B: Alternative Implementation (Recommended)

Since Option 3 (Custom Order Flow) is having auth issues, we might need to:

1. **Go back to Option 1**: Dynamic Variant Creation
   - Create variants on-the-fly for each custom cable
   - Use normal Medusa checkout flow
   - This avoids auth issues

2. **Use Store API instead of Admin API**
   - Create orders through the store API with customer tokens
   - Bypass admin authentication requirements

3. **Hybrid Approach**
   - Store custom details in metadata (we're already doing this)
   - Accept that price will be from placeholder variant
   - Display correct details from metadata in admin

Which approach would you prefer?

