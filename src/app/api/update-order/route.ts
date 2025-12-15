import { client } from '@/sanity/sanity-utils';
import { Order } from '@/types/order';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, ordersToUpdate } = body;

  if (!userId || !ordersToUpdate) {
    return NextResponse.json({ error: 'Missing Fields' }, { status: 400 });
  }

  try {
    const updatePromises = ordersToUpdate.map(async (order: Order) => {
      const { _id } = order;

      // Perform the update
      await client.patch(_id).set({ userId }).commit();
    });

    // Wait for all updates to complete
    const orders = await Promise.all(updatePromises);

    return NextResponse.json(
      { message: 'Orders updated successfully!' },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
