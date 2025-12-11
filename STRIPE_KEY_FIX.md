# Stripe Key Configuration Fix

## Problem
You're getting this error:
```
IntegrationError: You should not use your secret key with Stripe.js.
Please pass a publishable key instead.
```

## Root Cause
The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable is set to a **secret key** (`sk_...`) instead of a **publishable key** (`pk_...`).

## Solution

### 1. Get Your Stripe Keys

Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys) and get:

- **Publishable Key**: Starts with `pk_test_...` (for testing) or `pk_live_...` (for production)
- **Secret Key**: Starts with `sk_test_...` (for testing) or `sk_live_...` (for production)

### 2. Update Your `.env.local` File

In `front/.env.local`, make sure you have:

```env
# ✅ CORRECT - Publishable key (safe to expose in frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51CVkNtBdgOv1wiJ...

# ✅ CORRECT - Secret key (backend only, NEVER expose in frontend)
STRIPE_SECRET_KEY=sk_test_51CVkNtBdgOv1wiJ...
STRIPE_API_KEY=sk_test_51CVkNtBdgOv1wiJ...  # Same as STRIPE_SECRET_KEY
```

### 3. Key Differences

| Key Type | Starts With | Used In | Example |
|----------|-------------|---------|---------|
| **Publishable** | `pk_` | Frontend (browser) | `pk_test_51CVkNtBdgOv1wiJ...` |
| **Secret** | `sk_` | Backend (server) | `sk_test_51CVkNtBdgOv1wiJ...` |

### 4. Important Rules

- ✅ **Publishable keys** (`pk_...`) are safe to use in the browser
- ❌ **Secret keys** (`sk_...`) should NEVER be used in the browser
- ❌ **Secret keys** should NEVER be in `NEXT_PUBLIC_*` environment variables
- ✅ **Secret keys** should only be in server-side code (API routes, backend)

### 5. Verification

After updating your `.env.local`:

1. **Restart your Next.js dev server** (environment variables are loaded at startup)
2. Check the browser console - the error should be gone
3. The Stripe payment option should appear in checkout

### 6. Current Validation

The code now validates that:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_` (publishable key)
- If it starts with `sk_`, it will show an error and disable Stripe

## Still Having Issues?

1. **Check your `.env.local` file** - Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_`
2. **Restart your dev server** - Environment variables are loaded at startup
3. **Clear browser cache** - Sometimes cached values can cause issues
4. **Check Stripe Dashboard** - Make sure you're using the correct keys for your environment (test vs live)

