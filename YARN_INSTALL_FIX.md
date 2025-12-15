# Yarn Install Issues - Fix Guide

If you're experiencing yarn install issues, follow these steps:

## Quick Fix

```bash
cd zda-sanity

# 1. Clear yarn cache
yarn cache clean

# 2. Remove node_modules and lock files
Remove-Item -Recurse -Force node_modules, yarn.lock, package-lock.json -ErrorAction SilentlyContinue

# 3. Reinstall
yarn install
```

## Alternative: Use npm instead

If yarn continues to have issues, you can use npm:

```bash
cd zda-sanity

# Remove yarn.lock
Remove-Item yarn.lock -ErrorAction SilentlyContinue

# Install with npm
npm install
```

## Common Yarn Issues

### Issue 1: "yarn: command not found"

**Solution:** Install yarn globally
```bash
npm install -g yarn
```

### Issue 2: "Error: EACCES: permission denied"

**Solution:** Run with administrator privileges or fix permissions
```bash
# Windows PowerShell (as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 3: "Network timeout" or "ECONNRESET"

**Solution:** 
1. Check your internet connection
2. Try using a different registry:
```bash
yarn config set registry https://registry.npmjs.org/
yarn install
```

### Issue 4: "Package version conflicts"

**Solution:** Clear cache and reinstall
```bash
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

### Issue 5: Node version mismatch

**Solution:** Check your Node.js version
```bash
node --version
# Should be 18.x or higher

# If not, update Node.js from nodejs.org
```

## Verify Installation

After installation, verify everything is working:

```bash
# Check if dependencies are installed
yarn list --depth=0

# Or with npm
npm list --depth=0
```

## Next Steps

After successful installation:

1. Copy `.env.local.example` to `.env.local`
2. Update database credentials in `.env.local`
3. Run `npm run setup:db` or `yarn setup:db`
4. Start dev server: `npm run dev` or `yarn dev`

