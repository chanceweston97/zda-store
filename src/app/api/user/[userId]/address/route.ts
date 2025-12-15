import { prisma } from '@/lib/prismaDB';
import type { AddressType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const searchParams = req.nextUrl.searchParams;
  const addressType = searchParams.get('type');

  try {
    if (!addressType) {
      const data = await prisma.address.findMany({
        where: { userId },
      });

      return NextResponse.json(data);
    }
    const data = await prisma.address.findFirst({
      where: { userId, type: (addressType as AddressType) || undefined },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { address } = await req.json();

  if (!userId || !address) {
    return NextResponse.json('Missing Fields', { status: 400 });
  }

  try {
    const data = await prisma.address.create({
      data: {
        ...address,
        userId,
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const { address, id } = await req.json();

  if (!userId || !address || !id) {
    return NextResponse.json('Missing Fields', { status: 400 });
  }

  try {
    await prisma.address.update({
      where: { id, userId },
      data: address,
    });
  } catch (error) {
    return NextResponse.json('Internal Server Error', { status: 500 });
  }

  return NextResponse.json('Address updated successfully', { status: 200 });
}
