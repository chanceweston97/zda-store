import { getStripe } from "@lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { 
          error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
          details: "See STRIPE_SETUP.md for instructions"
        },
        { status: 500 }
      );
    }

    const { amount } = await request.json();

    // Validate amount
    if (!amount || amount <= 0 || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be greater than 0." },
        { status: 400 }
      );
    }

    // Ensure amount is an integer (Stripe requires integer cents)
    const amountInCents = Math.round(Number(amount));

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: "Amount must be at least $0.50" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Payment Intent Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal Server Error",
        details: error.type || "unknown_error"
      },
      { status: 500 }
    );
  }
}

