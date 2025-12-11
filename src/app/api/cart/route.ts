import { retrieveCart } from "@lib/data/cart"
import { removeCartId } from "@lib/data/cookies"
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

export async function DELETE() {
  try {
    await removeCartId()
    return NextResponse.json({ success: true, message: "Cart cleared" })
  } catch (error: any) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

