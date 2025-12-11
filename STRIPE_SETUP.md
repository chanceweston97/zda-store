# Stripe Setup Instructions

## Adding Your Stripe Keys

To enable Stripe payments on the checkout page, you need to add your Stripe keys to your environment variables.

### Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**

### Step 2: Add Keys to Environment Variables

Add the following to your `front/.env.local` file:

```env
# Stripe Keys
# ⚠️ IMPORTANT: Use PUBLISHABLE key (pk_...) NOT secret key (sk_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51CVkNtBdgOv1wiJ...
STRIPE_SECRET_KEY=sk_test_51CVkNtBdgOv1wiJ...
STRIPE_API_KEY=sk_test_51CVkNtBdgOv1wiJ...  # Same as STRIPE_SECRET_KEY
```

**Critical Notes:**
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - **MUST start with `pk_`** (publishable key)
- ❌ **NEVER use `sk_` (secret key) in `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
- ✅ `STRIPE_SECRET_KEY` - Starts with `sk_` (secret key, backend only)
- ⚠️ **If you see "You should not use your secret key with Stripe.js" error, you're using the wrong key type**
- For production, use your **live keys** (replace `test` with `live` in the key names)
- Never commit your `.env.local` file to version control

### Key Type Reference

| Key Type | Starts With | Used In | Example |
|----------|-------------|---------|---------|
| **Publishable** | `pk_` | Frontend (browser) | `pk_test_51CVkNtBdgOv1wiJ...` |
| **Secret** | `sk_` | Backend (server) | `sk_test_51CVkNtBdgOv1wiJ...` |

### Step 3: Restart Your Development Server

After adding the keys, restart your Next.js development server:

```bash
npm run dev
```

### Step 4: Test the Integration

1. Add items to your cart
2. Go to the checkout page
3. You should see the Stripe payment option
4. Use Stripe's test card numbers for testing:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

## Payment Methods

The checkout page supports two payment methods:

1. **Stripe (Bank/Card)** - Secure online payment via Stripe
2. **Cash on Delivery (COD)** - Payment upon delivery

## Troubleshooting

If Stripe is not working:

1. **Check environment variables**: Make sure both keys are set in `.env.local`
2. **Check console errors**: Look for any error messages in the browser console
3. **Verify API keys**: Ensure you're using the correct test/live keys
4. **Check Stripe Dashboard**: Verify your Stripe account is active and in test mode

## Production Deployment

For production:

1. Use your **live** Stripe keys (not test keys)
2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
3. Never expose `STRIPE_SECRET_KEY` in client-side code
4. Test thoroughly before going live

