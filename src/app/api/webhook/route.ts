import { prisma } from '@/lib/prismaDB';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();

  const headersList = await headers();
  const signature = headersList.get('Stripe-Signature') ?? '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
      { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email?.toLowerCase() as string;

  if (!email) {
    return new Response(null, {
      status: 200,
    });
  }

  // when first purchased
  if (event.type === 'checkout.session.completed') {
    console.log(
      session?.customer_details,
      session?.payment_intent,
      session?.amount_total,
      session?.metadata
    );

    const { email, address: shipping_address } = session?.customer_details!;

    const isAlreadyExist = await prisma.order.findUnique({
      where: {
        orderId: session.payment_intent as string,
      },
    });

    if (isAlreadyExist) {
      return new Response(null, {
        status: 200,
      });
    } else {
      const doc = {
        orderId: session.payment_intent as string,
        status: 'processing',
        totalPrice: Math.round(session.amount_total! / 100), // Convert cents to dollars
        userId: 'dddddddddd',
        userEmail: email?.toLowerCase()!,
        productQuantity: session?.metadata?.quantity!,
        orderTitle: session?.metadata?.names!,
        country: session?.customer_details?.address?.country!,
        city: shipping_address?.city!,
        postalCode: shipping_address?.postal_code!,
        line1: shipping_address?.line1!,
        line2: shipping_address?.line2!,
      };

      await prisma.order.create({ data: doc });
      console.log("Order created in database via webhook:", doc.orderId);
    }
  }

  return new Response(null, { status: 200 });
}
