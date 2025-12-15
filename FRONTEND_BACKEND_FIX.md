# Frontend Backend URL Fix

## Issue
The frontend `.env` had multiple backend URLs:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://18.191.243.236:9000,http://localhost:9000
```

This is incorrect - environment variables should only have ONE URL, not comma-separated values.

## Fix Applied
Updated to use local backend:
```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

## Why Localhost?
Since you're running the backend locally on your machine (even though it connects to the server database), the frontend should connect to `http://localhost:9000`.

## Configuration Summary

**Backend (`backend/.env`):**
- `DATABASE_URL=postgresql://medusa123:medusa123@18.191.243.236:5432/medusa123` (server DB)
- `MEDUSA_BACKEND_URL=http://localhost:9000` (runs locally)

**Frontend (`zda-sanity/.env`):**
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000` (connects to local backend)

## After Fix

1. **Restart your frontend dev server:**
   ```bash
   cd zda-sanity
   yarn dev
   ```

2. **Make sure backend is running:**
   ```bash
   cd backend
   yarn dev
   ```

3. Frontend will now connect to the local backend, which uses the server database.

## If Still Having Issues

Check:
- Backend is running on port 9000
- Frontend can reach `http://localhost:9000`
- No firewall blocking localhost connections
- Check browser console for specific error messages

