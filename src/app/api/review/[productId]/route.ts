import { prisma } from '@/lib/prismaDB';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        productID: productId,
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
