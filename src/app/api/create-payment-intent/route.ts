import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// Increase timeout for production (default is 10s on Vercel, 30s on Node.js)
export const maxDuration = 30; // 30 seconds
export const dynamic = 'force-dynamic';

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

    // Initialize Stripe instance with timeout
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      timeout: 20000, // 20 second timeout for Stripe API calls
      maxNetworkRetries: 2, // Retry up to 2 times on network errors
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

    // Create payment intent (Stripe SDK handles timeout via timeout option above)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Payment Intent Error:", error);
    
    // Handle timeout errors specifically
    if (error.message?.includes("timed out") || error.code === "ETIMEDOUT") {
      return NextResponse.json(
        { 
          error: "Payment service is temporarily unavailable. Please try again in a moment.",
          details: "timeout_error"
        },
        { status: 504 }
      );
    }
    
    // Handle Stripe-specific errors
    if (error.type === "StripeConnectionError" || error.type === "StripeAPIError") {
      return NextResponse.json(
        { 
          error: "Payment service connection error. Please try again.",
          details: error.type || "stripe_error"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Internal Server Error",
        details: error.type || "unknown_error"
      },
      { status: 500 }
    );
  }
}
