import { NextResponse } from "next/server";

export async function POST(request: Request) {
      return NextResponse.json(
    { 
      success: false, 
      message: "User registration is not available. Database (Prisma) has been removed. Consider using WordPress/WooCommerce authentication instead." 
    },
        { status: 503 }
      );
}
