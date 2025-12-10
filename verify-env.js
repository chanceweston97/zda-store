/**
 * Quick script to verify environment variables are loaded
 * Run with: node verify-env.js
 */

const fs = require('fs')
const path = require('path')

console.log("🔍 Checking environment variables...\n")

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '.env.local')
const envPath = path.join(__dirname, '.env')

let envVars = { ...process.env }

// Try to load .env.local if it exists
if (fs.existsSync(envLocalPath)) {
  console.log("📄 Found .env.local file\n")
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      if (key && cleanValue) {
        envVars[key.trim()] = cleanValue
      }
    }
  })
} else if (fs.existsSync(envPath)) {
  console.log("📄 Found .env file (consider using .env.local instead)\n")
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      const cleanValue = value.replace(/^["']|["']$/g, '')
      if (key && cleanValue) {
        envVars[key.trim()] = cleanValue
      }
    }
  })
} else {
  console.log("⚠️  No .env.local or .env file found!\n")
}

const requiredVars = {
  "MEDUSA_BACKEND_URL": envVars.MEDUSA_BACKEND_URL,
  "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY": envVars.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}

let allSet = true

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    const displayValue = key.includes("KEY") 
      ? value.substring(0, 20) + "..." 
      : value
    console.log(`✅ ${key}: ${displayValue}`)
  } else {
    console.log(`❌ ${key}: NOT SET`)
    allSet = false
  }
}

console.log("")

if (!allSet) {
  console.log("⚠️  Missing environment variables!")
  if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
    console.log("\n📝 Create a .env.local file in the front/ directory with:")
  } else {
    console.log("\n📝 Update your .env.local file to include:")
  }
  console.log("  MEDUSA_BACKEND_URL=http://localhost:9000")
  console.log("  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your-key-here")
  console.log("\n💡 After setting, restart your Next.js dev server!")
  console.log("   (Next.js only loads .env files on startup)")
  process.exit(1)
} else {
  console.log("✅ All required environment variables are set!")
  console.log("\n💡 Note: If you just created/updated .env.local, restart your dev server:")
  console.log("   npm run dev")
  console.log("   or")
  console.log("   yarn dev")
}

