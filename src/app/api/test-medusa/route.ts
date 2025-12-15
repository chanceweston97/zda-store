import { NextResponse } from "next/server";

/**
 * Simple test endpoint to check Medusa connection
 * Visit: http://localhost:8000/api/test-medusa
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "not set";
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "not set";
  const useMedusa = process.env.NEXT_PUBLIC_USE_MEDUSA || "not set";

  // Test direct fetch
  let directTest: any = { success: false, error: null };
  if (backendUrl !== "not set" && publishableKey !== "not set") {
    try {
      const url = `${backendUrl}/store/products?limit=1`;
      console.log(`[Test] Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          "x-publishable-api-key": publishableKey,
          "Content-Type": "application/json",
        },
      });

      console.log(`[Test] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        directTest = {
          success: true,
          productsCount: data.products?.length || 0,
          totalCount: data.count || 0,
        };
      } else {
        const errorText = await response.text();
        directTest = {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          status: response.status,
          statusText: response.statusText,
        };
      }
    } catch (error: any) {
      directTest = {
        success: false,
        error: error.message || String(error),
        type: error.name || "UnknownError",
      };
    }
  } else {
    directTest.error = "Missing environment variables";
  }

  return NextResponse.json({
    config: {
      backendUrl,
      publishableKey: publishableKey !== "not set" ? "***set***" : "not set",
      useMedusa,
    },
    directTest,
    instructions: {
      step1: "Check if backendUrl is correct and accessible",
      step2: "Check if publishableKey is valid",
      step3: "Check if Medusa backend is running",
      step4: "Check CORS settings in Medusa if you see CORS errors",
    },
  });
}

