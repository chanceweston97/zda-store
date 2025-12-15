# PowerShell script to fix yarn install issues on Windows
# Run: .\scripts\fix-yarn-install.ps1

Write-Host "🔧 Fixing yarn install issues..." -ForegroundColor Cyan

# Step 1: Kill any Node processes
Write-Host "`n1. Stopping Node processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*next*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Remove node_modules
Write-Host "2. Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   ✓ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "   ✓ node_modules not found" -ForegroundColor Green
}

# Step 3: Remove yarn cache
Write-Host "3. Clearing yarn cache..." -ForegroundColor Yellow
yarn cache clean
Write-Host "   ✓ Cache cleared" -ForegroundColor Green

# Step 4: Remove .yarn cache
Write-Host "4. Removing .yarn cache..." -ForegroundColor Yellow
if (Test-Path ".yarn\cache") {
    Remove-Item -Recurse -Force ".yarn\cache" -ErrorAction SilentlyContinue
    Write-Host "   ✓ .yarn cache removed" -ForegroundColor Green
}

# Step 5: Remove lock file (optional - uncomment if needed)
# Write-Host "5. Removing yarn.lock..." -ForegroundColor Yellow
# if (Test-Path "yarn.lock") {
#     Remove-Item -Force "yarn.lock" -ErrorAction SilentlyContinue
#     Write-Host "   ✓ yarn.lock removed" -ForegroundColor Green
# }

# Step 6: Reinstall
Write-Host "`n5. Running yarn install..." -ForegroundColor Yellow
yarn install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Success! Dependencies installed." -ForegroundColor Green
} else {
    Write-Host "`n❌ Installation failed. Try:" -ForegroundColor Red
    Write-Host "   1. Close all IDEs and terminals" -ForegroundColor Yellow
    Write-Host "   2. Run this script as Administrator" -ForegroundColor Yellow
    Write-Host "   3. Or use: npm install" -ForegroundColor Yellow
}

