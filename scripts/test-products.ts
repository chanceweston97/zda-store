/**
 * Test script to check why products aren't showing on store page
 * Run with: npx tsx scripts/test-products.ts
 */

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function testProducts() {
  console.log("🔍 Testing product fetching...\n")

  // Test 1: Check regions
  console.log("1️⃣ Testing regions...")
  try {
    const regionsResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    })
    
    if (!regionsResponse.ok) {
      console.error("❌ Failed to fetch regions:", regionsResponse.status, regionsResponse.statusText)
      const errorText = await regionsResponse.text()
      console.error("Error:", errorText)
      return
    }

    const regionsData = await regionsResponse.json()
    const regions = regionsData.regions || []
    
    if (regions.length === 0) {
      console.error("❌ No regions found! Please create a region in Medusa Admin.")
      return
    }

    console.log(`✅ Found ${regions.length} region(s):`)
    regions.forEach((region: any) => {
      console.log(`   - ${region.name} (ID: ${region.id}, Currency: ${region.currency_code})`)
      console.log(`     Countries: ${region.countries?.map((c: any) => c.iso_2).join(", ") || "None"}`)
    })

    const region = regions[0]
    const countryCode = region.countries?.[0]?.iso_2?.toLowerCase() || "us"
    console.log(`\n   Using region: ${region.name} (${countryCode})\n`)

    // Test 2: Check products
    console.log("2️⃣ Testing products...")
    const productsResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products?region_id=${region.id}&limit=100`,
      {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
      }
    )

    if (!productsResponse.ok) {
      console.error("❌ Failed to fetch products:", productsResponse.status, productsResponse.statusText)
      const errorText = await productsResponse.text()
      console.error("Error:", errorText)
      return
    }

    const productsData = await productsResponse.json()
    const products = productsData.products || []
    const count = productsData.count || 0

    console.log(`📦 Found ${count} total product(s), ${products.length} returned\n`)

    if (products.length === 0) {
      console.log("❌ No products returned!")
      console.log("\n📋 Checklist:")
      console.log("   ☐ Are products created in Medusa Admin?")
      console.log("   ☐ Are products PUBLISHED (not Draft)?")
      console.log("   ☐ Do products have at least one variant?")
      console.log("   ☐ Do variants have prices set?")
      console.log("   ☐ Are products assigned to a category?")
      console.log("   ☐ Are products available in the region?")
      return
    }

    // Test 3: Analyze products
    console.log("3️⃣ Analyzing products...\n")
    products.forEach((product: any, index: number) => {
      console.log(`Product ${index + 1}: ${product.title || "No title"}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Handle: ${product.handle || "No handle"}`)
      console.log(`   Status: ${product.status || "Unknown"}`)
      console.log(`   Variants: ${product.variants?.length || 0}`)
      
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant: any, vIndex: number) => {
          console.log(`     Variant ${vIndex + 1}: ${variant.title || "No title"}`)
          console.log(`       Price: ${variant.calculated_price?.calculated_amount ? `$${(variant.calculated_price.calculated_amount / 100).toFixed(2)}` : "No price"}`)
          console.log(`       Inventory: ${variant.inventory_quantity || 0}`)
        })
      } else {
        console.log(`   ⚠️  No variants - product won't show on store!`)
      }

      console.log(`   Categories: ${product.categories?.map((c: any) => c.name).join(", ") || "None"}`)
      console.log(`   Metadata: ${JSON.stringify(product.metadata || {})}`)
      console.log("")
    })

    // Test 4: Check if products have required fields
    console.log("4️⃣ Checking product requirements...\n")
    const issues: string[] = []
    
    products.forEach((product: any) => {
      if (product.status !== "published") {
        issues.push(`${product.title}: Status is "${product.status}" (should be "published")`)
      }
      if (!product.variants || product.variants.length === 0) {
        issues.push(`${product.title}: No variants`)
      } else {
        const hasPrice = product.variants.some((v: any) => 
          v.calculated_price?.calculated_amount
        )
        if (!hasPrice) {
          issues.push(`${product.title}: Variants have no prices`)
        }
      }
      if (!product.handle) {
        issues.push(`${product.title}: No handle/slug`)
      }
    })

    if (issues.length > 0) {
      console.log("⚠️  Issues found:")
      issues.forEach(issue => console.log(`   - ${issue}`))
    } else {
      console.log("✅ All products meet requirements!")
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message)
    console.error(error.stack)
  }
}

// Run the test
testProducts()

