# Medusa Connection Troubleshooting

## Common Errors and Solutions

### 1. CORS Error
**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: 
- Add your Next.js frontend URL to Medusa CORS settings
- In Medusa backend, update `medusa-config.js`:
  ```js
  projectConfig: {
    store_cors: "http://localhost:3000,https://your-production-url.com",
    admin_cors: "http://localhost:3000,https://your-production-url.com",
  }
  ```

### 2. 401 Unauthorized
**Error**: `HTTP error! status: 401`

**Solution**:
- Check your `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is correct
- Verify the key exists in Medusa Admin → Settings → Publishable API Keys
- Make sure the key is active and has proper permissions

### 3. 404 Not Found
**Error**: `HTTP error! status: 404`

**Solution**:
- Verify the Medusa backend URL is correct
- Check if Medusa backend is running: `http://18.191.243.236:9000/health`
- Ensure the API endpoint exists: `/store/products`

### 4. Network Error / Connection Refused
**Error**: `fetch failed` or `ECONNREFUSED`

**Solution**:
- Check if Medusa backend is running
- Verify the backend URL is accessible from your machine
- Check firewall/network settings
- Test in browser: `http://18.191.243.236:9000/store/products`

### 5. Region Required Error
**Error**: Products require a region_id

**Solution**:
- Medusa v2+ requires a region_id for pricing
- We need to fetch regions first and use one
- Update the code to get default region

### 6. Empty Products Array
**No Error but No Products**

**Solution**:
- Check if products exist in Medusa Admin
- Verify products are published
- Check if products have variants with prices
- Ensure products are in the correct sales channel

## Debug Steps

1. **Check Debug Endpoint**: `http://localhost:3000/api/debug/medusa`
   - Shows connection status
   - Shows error details
   - Shows product count

2. **Check Server Logs**: Look for `[MedusaClient]` logs in your terminal

3. **Test Direct API Call**: 
   ```bash
   curl -H "x-publishable-api-key: YOUR_KEY" http://18.191.243.236:9000/store/products
   ```

4. **Check Browser Console**: Look for network errors in DevTools

5. **Check Medusa Backend Logs**: Look for errors in Medusa server logs

## Quick Fixes

### If products show but images don't load:
- Medusa images might need full URLs
- Check image URL format in converted products

### If prices show as 0:
- Products need variants with calculated prices
- Check if region is set correctly
- Verify products have pricing configured

