import { retrieveCart } from "@lib/data/cart"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cart = await retrieveCart()
    return NextResponse.json({ cart })
  } catch (error: any) {
    console.error("Error retrieving cart:", error)
    return NextResponse.json({ cart: null }, { status: 200 })
  }
}

