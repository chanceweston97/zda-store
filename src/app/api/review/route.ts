import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Reviews are not available. Database (Prisma) has been removed. Consider implementing reviews using Medusa metadata or a separate service.' 
    },
    { status: 503 }
  );
}
