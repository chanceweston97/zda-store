import Stripe from "stripe"; 

// Lazy initialization - only create Stripe instance when actually used
// This prevents build failures when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set. Please set it in your .env.production file on the server.");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }
  return stripeInstance;
}

// Create a proxy that lazily initializes Stripe only when methods are called
// This allows the module to be imported during build without throwing errors
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe();
    const value = instance[prop as keyof Stripe];
    // If it's a function, bind it to the instance
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
}) as Stripe;
  