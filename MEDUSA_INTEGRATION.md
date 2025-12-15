# Medusa Backend Integration Guide

This guide explains how to integrate the Medusa backend with your existing Sanity frontend project.

## Overview

Instead of migrating everything at once, we'll:
1. **Extract Sanity data** to local JSON/TS files (removes Sanity dependency gradually)
2. **Create Medusa integration layer** that works alongside Sanity
3. **Gradually replace** Sanity queries with Medusa API calls
4. **Keep existing frontend** - no need to rebuild everything

## Step 1: Extract Sanity Data to Local Files

First, extract all your Sanity data to local files so you can remove Sanity later:

```bash
# Install tsx if not already installed
npm install -D tsx

# Run extraction script
npm run extract:sanity
# Or directly:
tsx scripts/extract-sanity-to-local.ts
```

This will create:
- `data/extracted/products.json` and `products.ts`
- `data/extracted/categories.json` and `categories.ts`
- `data/extracted/content.json` and `content.ts`
- `data/extracted/cable-customizer.json` and `cable-customizer.ts`

## Step 2: Configure Medusa Backend

Add these environment variables to your `.env.local`:

```env
# Medusa Backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
# Or your production URL:
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-medusa-backend.com

# Medusa Publishable Key (get from Medusa Admin)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here

# Enable Medusa integration (set to "true" when ready)
NEXT_PUBLIC_USE_MEDUSA=false
```

## Step 3: Integration Architecture

### File Structure

```
zda-sanity/
├── src/
│   ├── lib/
│   │   ├── medusa/          # Medusa integration layer
│   │   │   ├── config.ts    # Configuration
│   │   │   ├── client.ts    # Medusa API client
│   │   │   └── products.ts  # Product functions
│   │   └── data/
│   │       └── unified-data.ts  # Unified data layer
│   └── sanity/              # Existing Sanity code (keep for now)
├── data/
│   └── extracted/           # Extracted Sanity data
└── scripts/
    └── extract-sanity-to-local.ts
```

### How It Works

1. **Unified Data Layer** (`lib/data/unified-data.ts`)
   - Checks if Medusa is enabled
   - Tries Medusa first, falls back to Sanity
   - Provides same interface as Sanity functions

2. **Medusa Client** (`lib/medusa/client.ts`)
   - Simple fetch-based client (no heavy dependencies)
   - Handles authentication with publishable key
   - Converts Medusa products to Sanity format

3. **Gradual Migration**
   - Start with `NEXT_PUBLIC_USE_MEDUSA=false` (uses Sanity)
   - Test Medusa integration
   - Switch to `NEXT_PUBLIC_USE_MEDUSA=true` when ready
   - Remove Sanity code gradually

## Step 4: Update Your Code to Use Unified Data Layer

### Before (Sanity only):

```typescript
import { getAllProducts } from "@/sanity/sanity-shop-utils";

const products = await getAllProducts();
```

### After (Unified layer):

```typescript
import { getAllProducts } from "@/lib/data/unified-data";

const products = await getAllProducts();
// Works with both Sanity and Medusa!
```

## Step 5: Integration Checklist

### Phase 1: Setup (Current)
- [x] Create data extraction script
- [x] Create Medusa integration layer
- [x] Create unified data layer
- [ ] Add environment variables
- [ ] Test data extraction

### Phase 2: Products Integration
- [ ] Update shop page to use unified data layer
- [ ] Test product listing from Medusa
- [ ] Test product detail pages
- [ ] Handle product images (Medusa vs Sanity)

### Phase 3: Cart Integration
- [ ] Integrate Medusa cart with existing shopping cart
- [ ] Update add to cart functionality
- [ ] Test checkout flow

### Phase 4: Content Migration
- [ ] Migrate categories to Medusa
- [ ] Migrate static content (hero, FAQ, etc.) to local files
- [ ] Remove Sanity content queries

### Phase 5: Complete Migration
- [ ] Remove Sanity dependencies
- [ ] Remove Sanity schemas
- [ ] Clean up unused code

## Step 6: Testing

1. **Test with Sanity (current state)**
   ```bash
   NEXT_PUBLIC_USE_MEDUSA=false npm run dev
   ```

2. **Test with Medusa**
   ```bash
   NEXT_PUBLIC_USE_MEDUSA=true npm run dev
   ```

3. **Compare results** - both should work identically

## Troubleshooting

### Medusa connection fails
- Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL` is correct
- Verify Medusa backend is running
- Check `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set

### Products not showing
- Check browser console for errors
- Verify Medusa has products in admin
- Check region is set up in Medusa

### Images not loading
- Medusa images use different format than Sanity
- May need to update image handling in components

## Next Steps

1. Run the extraction script to save your Sanity data
2. Configure Medusa environment variables
3. Test the unified data layer
4. Gradually migrate pages one by one

## Benefits of This Approach

✅ **No breaking changes** - existing code continues to work  
✅ **Gradual migration** - move at your own pace  
✅ **Easy rollback** - just change environment variable  
✅ **Keep existing UI** - no need to rebuild components  
✅ **Data backup** - all Sanity data saved locally  

