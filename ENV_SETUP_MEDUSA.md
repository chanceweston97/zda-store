# Medusa Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file (or `.env` file):

```env
# Medusa Backend URL (your Medusa server)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://18.191.243.236:9000

# Medusa Publishable Key (get from Medusa Admin)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key_here

# Enable Medusa integration (MUST be "true" as a string)
NEXT_PUBLIC_USE_MEDUSA=true
```

## Important Notes

1. **NEXT_PUBLIC_USE_MEDUSA must be the string "true"**
   - ✅ Correct: `NEXT_PUBLIC_USE_MEDUSA=true`
   - ❌ Wrong: `NEXT_PUBLIC_USE_MEDUSA=1` or `NEXT_PUBLIC_USE_MEDUSA=True`

2. **Restart your Next.js server after changing .env files**
   - Environment variables are loaded at startup
   - Stop the server (Ctrl+C) and run `npm run dev` again

3. **Get your Publishable Key**
   - Go to your Medusa Admin: `http://18.191.243.236:9000/app`
   - Navigate to: **Settings** → **Publishable API Keys**
   - Create a new key or copy an existing one
   - Add it to your `.env.local` file

## Verify Setup

After setting the variables and restarting:

1. Visit: `http://localhost:3000/api/debug/medusa`
2. You should see:
   ```json
   {
     "status": "ok",
     "config": {
       "enabled": true,
       "backendUrl": "http://18.191.243.236:9000",
       "publishableKey": "set",
       "useMedusa": "true"
     }
   }
   ```

## Troubleshooting

### Still shows "disabled" after setting variables?

1. **Check the file name**: Use `.env.local` (not `.env.example`)
2. **Check the value**: Must be exactly `true` (lowercase, no quotes)
3. **Restart the server**: Environment variables load at startup
4. **Check for typos**: Variable names are case-sensitive

### Publishable key not working?

1. Make sure the key exists in Medusa Admin
2. Check the key has proper permissions
3. Verify the Medusa backend is accessible from your Next.js app

