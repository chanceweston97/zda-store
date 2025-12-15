# Medusa Backend Setup Guide

## Quick Start

### 1. Update Environment Variables

Add these to your `.env.local` or `.env` file:

```env
# Medusa Backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
# Or for production:
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-medusa-backend.com

# Medusa Publishable Key (get from Medusa Admin)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here

# Enable Medusa integration
NEXT_PUBLIC_USE_MEDUSA=true
```

### 2. Get Your Medusa Publishable Key

1. Start your Medusa backend
2. Go to Medusa Admin: `http://localhost:9000/app`
3. Navigate to **Settings** → **Publishable API Keys**
4. Create a new key or copy an existing one
5. Add it to your `.env` file

### 3. Test the Connection

The shop page (`/shop`) is now connected to Medusa. When you:
- Set `NEXT_PUBLIC_USE_MEDUSA=true` → Uses Medusa products
- Set `NEXT_PUBLIC_USE_MEDUSA=false` → Uses local data (fallback)

### 4. Verify It's Working

1. Start your Next.js app: `npm run dev`
2. Visit: `http://localhost:3000/shop`
3. Check the console logs - you should see:
   - `Using X products from Medusa` (if Medusa is enabled)
   - `Using X products from local data` (if Medusa is disabled or fails)

## Troubleshooting

### Products not showing from Medusa

1. **Check Medusa backend is running**
   ```bash
   # In your Medusa backend directory
   npm run dev
   ```

2. **Verify environment variables**
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL` should match your Medusa server
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` should be valid

3. **Check browser console**
   - Look for any fetch errors
   - Check network tab for API calls to Medusa

4. **Verify Medusa has products**
   - Go to Medusa Admin
   - Check Products section has items

### Connection errors

- Make sure Medusa backend is accessible from your Next.js app
- Check CORS settings in Medusa if running on different ports
- Verify the publishable key has correct permissions

## Next Steps

After connecting the shop page:
1. ✅ Shop page connected
2. ⏳ Product detail pages
3. ⏳ Cart integration
4. ⏳ Checkout integration
5. ⏳ Categories from Medusa

