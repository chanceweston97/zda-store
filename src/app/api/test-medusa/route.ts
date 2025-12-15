import { NextResponse } from "next/server";
import { medusaConfig, validateMedusaConfig } from "@/lib/medusa/config";

/**
 * Simple test endpoint to check Medusa connection
 * Visit: http://localhost:8000/api/test-medusa
 * Or on server: http://18.191.243.236:8000/api/test-medusa
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "not set";
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "not set";
  const useMedusa = process.env.NEXT_PUBLIC_USE_MEDUSA || "not set";
  
  // Validate configuration
  const configValid = validateMedusaConfig();
  const configIssues: string[] = [];
  
  if (backendUrl === "not set" || backendUrl === "http://localhost:9000") {
    configIssues.push("NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set or using localhost");
  }
  
  if (backendUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    configIssues.push("Using localhost in production - this will fail on server");
  }
  
  if (publishableKey === "not set") {
    configIssues.push("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set");
  }

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
      nodeEnv: process.env.NODE_ENV,
      configValid,
      configIssues: configIssues.length > 0 ? configIssues : undefined,
    },
    directTest,
    instructions: {
      step1: "Check if backendUrl is correct and accessible",
      step2: "Check if publishableKey is valid",
      step3: "Check if Medusa backend is running",
      step4: "Check CORS settings in Medusa if you see CORS errors",
      step5: configIssues.length > 0 
        ? "⚠️ Fix configuration issues above, then rebuild: yarn build"
        : "Configuration looks good",
    },
    troubleshooting: {
      if500Error: [
        "1. Check server logs: pm2 logs FrontEnd",
        "2. Verify .env file has correct NEXT_PUBLIC_MEDUSA_BACKEND_URL (not localhost)",
        "3. Rebuild after changing env vars: yarn build",
        "4. Restart: pm2 restart FrontEnd",
        "5. Test Medusa directly: curl http://18.191.243.236:9000/store/products?limit=1",
      ],
      ifConnectionRefused: [
        "1. Check if Medusa backend is running: pm2 status",
        "2. Check Medusa logs: pm2 logs medusaBackend",
        "3. Verify firewall allows internal connections",
        "4. Test from server: curl http://18.191.243.236:9000/store/products?limit=1",
      ],
    },
  });
}

