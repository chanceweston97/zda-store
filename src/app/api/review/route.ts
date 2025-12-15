import { prisma } from '@/lib/prismaDB';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { name, email, comment, ratings, productID } = body;

  try {
    const review = await prisma.review.create({
      data: {
        productID,
        name,
        email,
        comment,
        ratings,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
