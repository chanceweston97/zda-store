import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to verify Medusa Admin API Key is working
 * GET /api/test-admin-key
 */
export async function GET(req: NextRequest) {
  try {
    const adminApiKey = process.env.MEDUSA_ADMIN_API_KEY 
      || process.env.MEDUSA_SECRET_API_KEY
      || process.env.MEDUSA_API_KEY;

    const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

    if (!adminApiKey) {
      return NextResponse.json({
        success: false,
        message: "API key not found in environment variables",
        checked: [
          "MEDUSA_ADMIN_API_KEY",
          "MEDUSA_SECRET_API_KEY", 
          "MEDUSA_API_KEY"
        ],
        instructions: "Add MEDUSA_ADMIN_API_KEY=sk_xxx to your .env file",
      });
    }

    // Test the API key by making a simple request to Medusa Admin API
    // Try x-medusa-access-token first (Medusa v2 preferred), then Bearer token
    try {
      let testResponse;
      
      // Method 1: Try x-medusa-access-token (Medusa v2)
      try {
        testResponse = await fetch(`${medusaBackendUrl}/admin/products?limit=1`, {
          method: "GET",
          headers: {
            "x-medusa-access-token": adminApiKey,
            "Content-Type": "application/json",
          },
        });
        
        // If 401, try Bearer token
        if (testResponse.status === 401) {
          testResponse = await fetch(`${medusaBackendUrl}/admin/products?limit=1`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${adminApiKey}`,
              "Content-Type": "application/json",
            },
          });
        }
      } catch (firstError) {
        // Fallback to Bearer if x-medusa-access-token fails
        testResponse = await fetch(`${medusaBackendUrl}/admin/products?limit=1`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${adminApiKey}`,
            "Content-Type": "application/json",
          },
        });
      }

      const statusCode = testResponse.status;
      const responseText = await testResponse.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText.substring(0, 200) };
      }

      if (testResponse.ok) {
        return NextResponse.json({
          success: true,
          message: "✅ API Key is working correctly!",
          apiKeyInfo: {
            keyPrefix: adminApiKey.substring(0, 10) + "...",
            keyLength: adminApiKey.length,
            startsWithSk: adminApiKey.startsWith('sk_'),
          },
          backendUrl: medusaBackendUrl,
          testResult: {
            status: statusCode,
            productsFound: responseData.products?.length || 0,
          },
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `❌ API Key authentication failed (Status: ${statusCode})`,
          apiKeyInfo: {
            keyPrefix: adminApiKey.substring(0, 15) + "...",
            keyLength: adminApiKey.length,
            startsWithSk: adminApiKey.startsWith('sk_'),
            format: adminApiKey.startsWith('sk_live_') ? 'live' : 
                    adminApiKey.startsWith('sk_test_') ? 'test' : 
                    adminApiKey.startsWith('sk_') ? 'standard (valid)' : 'unknown',
            warning: !adminApiKey.startsWith('sk_') ? "⚠️ Key doesn't start with 'sk_' - make sure you're using a Secret API Key, not a Publishable Key" : null,
          },
          backendUrl: medusaBackendUrl,
          error: {
            status: statusCode,
            response: responseData,
          },
          troubleshooting: {
            if401: "Check that your API key is correct and is a Secret API Key (starts with 'sk_')",
            if403: "API key might not have the right permissions",
            if404: "Backend URL might be incorrect",
            general: [
              "1. Go to Medusa Admin → Settings → Secret API Keys",
              "2. Create a new Secret API Key",
              "3. Copy the key (starts with 'sk_')",
              "4. Add to .env: MEDUSA_ADMIN_API_KEY=sk_xxx",
              "5. Restart your dev server",
            ],
          },
        }, { status: 400 });
      }
    } catch (fetchError: any) {
      return NextResponse.json({
        success: false,
        message: "❌ Failed to connect to Medusa backend",
        apiKeyInfo: {
          keyPrefix: adminApiKey.substring(0, 10) + "...",
          keyLength: adminApiKey.length,
          startsWithSk: adminApiKey.startsWith('sk_'),
        },
        backendUrl: medusaBackendUrl,
        error: {
          message: fetchError.message,
          type: fetchError.name,
        },
        troubleshooting: [
          "Check that your Medusa backend is running",
          `Verify backend URL is correct: ${medusaBackendUrl}`,
          "Try accessing the backend directly in your browser",
        ],
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Error testing API key",
      error: error.message,
    }, { status: 500 });
  }
}

