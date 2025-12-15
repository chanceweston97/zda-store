import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      subscribers: [],
      count: 0,
      message: "Newsletter subscriptions are not available. Database (Prisma) has been removed."
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      message: "Newsletter subscriptions are not available. Database (Prisma) has been removed. Consider using an external service like Mailchimp or integrating with Medusa."
    },
    { status: 503 }
  );
}
