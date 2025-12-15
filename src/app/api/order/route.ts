import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      orders: [],
      message: "Orders are managed through Medusa. Database (Prisma) has been removed."
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: "Order updates are not available. Database (Prisma) has been removed. Use Medusa Admin API to manage orders."
    },
    { status: 503 }
  );
}
