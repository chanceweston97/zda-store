import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // NOTE: This route previously saved orders to Prisma database.
  // Orders are now managed exclusively through WooCommerce.
  // This endpoint can be removed or kept for backward compatibility.
  
      return NextResponse.json(
    { 
      success: false,
      message: "Order storage to local database is not available. Database (Prisma) has been removed. Orders are managed through WooCommerce checkout flow."
    },
    { status: 503 }
    );
  }
