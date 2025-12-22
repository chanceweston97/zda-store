import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return NextResponse.json(
        { 
          error: "Payment service is not configured. Please contact support.",
          details: "missing_stripe_key"
        },
        { status: 500 }
      );
    }

    // Initialize Stripe instance
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

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

    // Removed $0.50 minimum check - allow any amount > 0, Stripe will handle validation
    if (amountInCents < 1) {
      return NextResponse.json(
        { error: "Amount must be greater than $0.00" },
        { status: 400 }
      );
    }

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
