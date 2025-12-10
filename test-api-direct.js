/**
 * Direct API test script - tests the Medusa API without Next.js
 * Run with: node test-api-direct.js
 */

const fs = require('fs')
const path = require('path')

// Load .env.local
const envLocalPath = path.join(__dirname, '.env.local')
let envVars = {}

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
      if (key && value) {
        envVars[key.trim()] = value
      }
    }
  })
}

const BACKEND_URL = envVars.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = envVars.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

console.log('🔍 Testing Medusa API directly...\n')
console.log(`Backend URL: ${BACKEND_URL}`)
console.log(`Publishable Key: ${PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 20) + '...' : 'NOT SET'}\n`)

if (!PUBLISHABLE_KEY) {
  console.error('❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set!')
  process.exit(1)
}

async function testAPI() {
  try {
    // Step 1: Test regions
    console.log('1️⃣ Testing regions...')
    const regionsResponse = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!regionsResponse.ok) {
      const errorText = await regionsResponse.text()
      console.error(`❌ Failed to fetch regions: ${regionsResponse.status} ${regionsResponse.statusText}`)
      console.error(`Error: ${errorText}`)
      return
    }

    const regionsData = await regionsResponse.json()
    const regions = regionsData.regions || []

    if (regions.length === 0) {
      console.error('❌ No regions found!')
      return
    }

    console.log(`✅ Found ${regions.length} region(s)`)
    const region = regions[0]
    console.log(`   Using: ${region.name} (ID: ${region.id})\n`)

    // Step 2: Test products
    console.log('2️⃣ Testing products...')
    const productsUrl = `${BACKEND_URL}/store/products?region_id=${region.id}&limit=100&fields=*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories`
    
    const productsResponse = await fetch(productsUrl, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text()
      console.error(`❌ Failed to fetch products: ${productsResponse.status} ${productsResponse.statusText}`)
      console.error(`Error: ${errorText}`)
      return
    }

    const productsData = await productsResponse.json()
    const products = productsData.products || []
    const count = productsData.count || 0

    console.log(`✅ API Response:`)
    console.log(`   Total count: ${count}`)
    console.log(`   Products returned: ${products.length}\n`)

    if (products.length === 0) {
      console.log('⚠️  No products returned from API!')
      console.log('\n📋 Possible reasons:')
      console.log('   ☐ Products are in Draft status (must be Published)')
      console.log('   ☐ Products have no variants')
      console.log('   ☐ Variants have no prices set')
      console.log('   ☐ Products not assigned to sales channel')
      console.log('   ☐ Products not available in the region')
      return
    }

    // Step 3: Analyze products
    console.log('3️⃣ Product Analysis:\n')
    products.slice(0, 5).forEach((product, index) => {
      console.log(`Product ${index + 1}: ${product.title}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Status: ${product.status}`)
      console.log(`   Handle: ${product.handle || 'MISSING'}`)
      console.log(`   Variants: ${product.variants?.length || 0}`)
      
      if (product.variants && product.variants.length > 0) {
        const hasPrice = product.variants.some(v => v.calculated_price?.calculated_amount)
        console.log(`   Has prices: ${hasPrice ? '✅' : '❌'}`)
      } else {
        console.log(`   ⚠️  No variants!`)
      }
      
      console.log(`   Categories: ${product.categories?.map(c => c.name).join(', ') || 'None'}`)
      console.log(`   Metadata productType: ${product.metadata?.productType || 'NOT SET'}`)
      console.log('')
    })

    // Step 4: Summary
    console.log('4️⃣ Summary:')
    const published = products.filter(p => p.status === 'published').length
    const withVariants = products.filter(p => p.variants && p.variants.length > 0).length
    const withPrices = products.filter(p => 
      p.variants && p.variants.some(v => v.calculated_price?.calculated_amount)
    ).length

    console.log(`   Total products: ${count}`)
    console.log(`   Published: ${published}`)
    console.log(`   With variants: ${withVariants}`)
    console.log(`   With prices: ${withPrices}`)

    if (published === 0) {
      console.log('\n⚠️  No published products found!')
      console.log('   Go to Medusa Admin and publish your products.')
    } else if (withVariants === 0) {
      console.log('\n⚠️  Products have no variants!')
      console.log('   Add variants to your products in Medusa Admin.')
    } else if (withPrices === 0) {
      console.log('\n⚠️  Variants have no prices!')
      console.log('   Set prices for your variants in Medusa Admin.')
    } else {
      console.log('\n✅ Products look good! They should display on the storefront.')
      console.log('   If they still don\'t show, check browser console for errors.')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.cause) {
      console.error('Cause:', error.cause)
    }
  }
}

testAPI()



