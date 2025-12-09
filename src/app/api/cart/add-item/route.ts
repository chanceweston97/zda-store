import { addToCart } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variantId, quantity, countryCode } = body

    if (!variantId || !quantity || !countryCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

