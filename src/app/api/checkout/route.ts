import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const cartDetails = await req.json();

    if (!cartDetails || Object.keys(cartDetails).length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // validate the priceId and ensure prices are valid
    const structuredData = {
      line_items: Object.values(cartDetails).map((item: any) => {
        // Validate item price
        if (!item.price || item.price <= 0 || isNaN(item.price)) {
          throw new Error(`Invalid price for item: ${item.name || 'Unknown'}`);
        }

        // Ensure price is an integer (Stripe requires integer cents)
        const unitAmount = Math.round(Number(item.price));

        if (unitAmount < 50) {
          throw new Error(`Price too low for item: ${item.name || 'Unknown'}. Minimum is $0.50`);
        }

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name || 'Product',
              images: item.image ? [item.image] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: item.quantity || 1,
        };
      }),
    };

  const allQuantity = structuredData.line_items
    .map((item: any) => item.quantity)
    .reduce((a: any, b: any) => a + b, 0);

  const allNames = structuredData.line_items
    .map((item: any) => item.price_data.product_data.name)
    .join(' & ');

    if (!structuredData.line_items || structuredData.line_items.length === 0) {
      return NextResponse.json(
        { error: "No valid items in cart" },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin');

    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: structuredData.line_items,
      currency: 'usd',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate: 'shr_1OEXL0LtGdPVhGLeUX3qlYJB',
        },
      ],
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      metadata: {
        quantity: allQuantity,
        names: allNames,
      },
    });

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal Server Error',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
