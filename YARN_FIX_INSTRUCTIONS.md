# Yarn Install EPERM Error - Fix Instructions

## The Problem

You're getting this error:
```
Error: EPERM: operation not permitted, unlink 'C:\dev\ZDA_MEDUSA\zda-sanity\node_modules\@tailwindcss\oxide-win32-x64-msvc\tailwindcss-oxide.win32-x64-msvc.node'
```

This happens because a file is locked by another process (usually your IDE, a dev server, or Windows file system).

## Solution 1: Use npm Instead (Easiest)

Since yarn is having permission issues, use npm:

```powershell
cd C:\dev\ZDA_MEDUSA\zda-sanity

# Remove yarn.lock
Remove-Item yarn.lock -ErrorAction SilentlyContinue

# Install with npm
npm install
```

npm handles file locking better on Windows.

## Solution 2: Close All Processes and Retry

1. **Close Cursor/VS Code completely**
2. **Close all terminal windows**
3. **Stop any dev servers** (Ctrl+C in any running terminals)
4. **Open a NEW PowerShell window as Administrator**
5. **Run:**

```powershell
cd C:\dev\ZDA_MEDUSA\zda-sanity

# Remove everything
Remove-Item -Recurse -Force node_modules, .yarn\cache -ErrorAction SilentlyContinue

# Clear yarn cache
yarn cache clean

# Try install again
yarn install
```

## Solution 3: Use the Fix Script

Run the automated fix script:

```powershell
cd C:\dev\ZDA_MEDUSA\zda-sanity
.\scripts\fix-yarn-install.ps1
```

## Solution 4: Manual File Unlock

If the file is still locked:

1. **Open Task Manager** (Ctrl+Shift+Esc)
2. **End all Node.js processes**
3. **End Cursor/VS Code processes** (if safe to do so)
4. **Wait 5 seconds**
5. **Try yarn install again**

## Solution 5: Use Yarn with --ignore-engines

Sometimes yarn is too strict. Try:

```powershell
yarn install --ignore-engines
```

## Recommended: Just Use npm

For this project, **npm works perfectly fine** and avoids these Windows permission issues:

```powershell
# Remove yarn files
Remove-Item yarn.lock, .yarn -Recurse -Force -ErrorAction SilentlyContinue

# Install with npm
npm install

# Use npm for all commands going forward
npm run dev
npm run build
# etc.
```

## After Installation

Once installed (with either yarn or npm), continue with:

```powershell
# Setup database
npm run setup:db
# or
yarn setup:db

# Start dev server
npm run dev
# or
yarn dev
```

## Why This Happens

- Windows file locking is stricter than Linux/Mac
- Tailwind CSS uses native binaries that can get locked
- IDEs often keep file handles open
- Yarn 4.x has stricter file handling

**Bottom line:** npm is more Windows-friendly for this issue.

