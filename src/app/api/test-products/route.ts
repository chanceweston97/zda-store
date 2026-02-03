import { NextResponse } from "next/server";
import { getAllProducts, getAllProductsCount, getCategoriesWithSubcategories } from "@/lib/data/unified-data";

/** Do not run at build time — avoids Cloudflare blocking WooCommerce. */
export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: Get all products
  try {
    console.log("[test-products] Testing getAllProducts()...");
    const products = await getAllProducts();
    results.tests.getAllProducts = {
      success: true,
      productCount: products?.length || 0,
      hasProducts: (products?.length || 0) > 0,
      firstProduct: products && products.length > 0 ? {
        id: products[0]._id || products[0].id,
        name: products[0].name || products[0].title,
        handle: products[0].handle || products[0].slug?.current,
        hasPrice: !!products[0].price,
        hasImages: !!(products[0].thumbnails || products[0].images),
      } : null,
    };
  } catch (error: any) {
    results.tests.getAllProducts = {
      success: false,
      error: error?.message || String(error),
      status: error?.status,
      connectionError: error?.connectionError,
      timeoutError: error?.timeoutError,
      hint: error?.hint,
    };
  }

  // Test 2: Get product count
  try {
    console.log("[test-products] Testing getAllProductsCount()...");
    const count = await getAllProductsCount();
    results.tests.getAllProductsCount = {
      success: true,
      count: count || 0,
    };
  } catch (error: any) {
    results.tests.getAllProductsCount = {
      success: false,
      error: error?.message || String(error),
    };
  }

  // Test 3: Get categories
  try {
    console.log("[test-products] Testing getCategoriesWithSubcategories()...");
    const categories = await getCategoriesWithSubcategories();
    results.tests.getCategories = {
      success: true,
      categoryCount: categories?.length || 0,
      hasCategories: (categories?.length || 0) > 0,
      firstCategory: categories && categories.length > 0 ? {
        id: categories[0].id || categories[0]._id,
        name: categories[0].title || categories[0].name,
        handle: categories[0].handle || categories[0].slug?.current,
      } : null,
    };
  } catch (error: any) {
    results.tests.getCategories = {
      success: false,
      error: error?.message || String(error),
    };
  }

  // Summary
  const allTestsPassed = Object.values(results.tests).every((test: any) => test.success);
  results.summary = {
    allTestsPassed,
    totalTests: Object.keys(results.tests).length,
    passedTests: Object.values(results.tests).filter((test: any) => test.success).length,
  };

  // Recommendations
  results.recommendations = [];
  if (results.tests.getAllProducts?.success && results.tests.getAllProducts.productCount === 0) {
    results.recommendations.push("Products fetch succeeded but returned 0 products. Check if WooCommerce has products.");
  }

  return NextResponse.json(results, {
    status: allTestsPassed ? 200 : 500,
  });
}

