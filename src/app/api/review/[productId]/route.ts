import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  return NextResponse.json(
    { 
      reviews: [],
      message: 'Reviews are not available. Database (Prisma) has been removed.' 
    },
    { status: 200 }
  );
}
