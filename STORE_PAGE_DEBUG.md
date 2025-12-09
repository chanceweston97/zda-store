# Store Page Debugging Guide

## Issue: Products Not Showing on Store Page

### Quick Checks

1. **Check if products exist in Medusa Admin:**
   - Go to `http://localhost:9000/app`
   - Navigate to **Products > Products**
   - Verify products are created

2. **Check Product Status:**
   - Products MUST be **"Published"** (not "Draft")
   - In product edit page, check the status dropdown at the top
   - Change to "Published" if it's "Draft"

3. **Check Product Variants:**
   - Each product MUST have at least one variant
   - Go to **Variants** tab in product edit page
   - Create a variant if none exist
   - Variant MUST have a price set

4. **Check Region Setup:**
   - Go to **Settings > Regions**
   - Make sure at least one region exists
   - Products need to be available in a region

5. **Check Categories:**
   - Products should be assigned to a category
   - Go to **Products > Categories** to create categories

### Debug Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Store Page Debug:" logs
   - Check for any errors

2. **Check Network Tab:**
   - Open DevTools > Network tab
   - Refresh the store page
   - Look for `/store/products` request
   - Check the response:
     - Status code (should be 200)
     - Response body (should have products array)

3. **Run Test Script:**
   ```bash
   cd front
   npx tsx scripts/test-products.ts
   ```
   This will test the API directly and show what's wrong.

### Common Issues

#### Issue 1: Products are Draft
**Solution:** Change product status to "Published" in Medusa Admin

#### Issue 2: No Variants
**Solution:** 
- Go to product edit page
- Click "Variants" tab
- Click "Add Variant"
- Fill in title, SKU, price, and inventory
- Save

#### Issue 3: Variants Have No Prices
**Solution:**
- Edit the variant
- Make sure price is set
- Price should be in the region's currency

#### Issue 4: Products Not in Region
**Solution:**
- Check if products are available in the region
- In Medusa v2, products are available in all regions by default
- But variants need prices in the region's currency

#### Issue 5: Cache Issues
**Solution:**
- Clear Next.js cache:
  ```bash
  cd front
  rm -rf .next
  npm run dev
  ```

### Testing the API Directly

You can test the Medusa API directly:

```bash
# Get regions
curl http://localhost:9000/store/regions \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY"

# Get products (replace REGION_ID with actual region ID)
curl "http://localhost:9000/store/products?region_id=REGION_ID&limit=100" \
  -H "x-publishable-api-key: YOUR_PUBLISHABLE_KEY"
```

### What the Store Page Expects

The store page expects:
1. ✅ At least one region exists
2. ✅ Products are published (status = "published")
3. ✅ Products have at least one variant
4. ✅ Variants have prices set
5. ✅ Products are assigned to categories (optional but recommended)

### Next Steps

1. Check the browser console for "Store Page Debug:" logs
2. Run the test script: `npx tsx scripts/test-products.ts`
3. Verify products meet all requirements above
4. Check backend logs for any errors

