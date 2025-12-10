import { updateLineItem } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineId, quantity } = body

    if (!lineId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await updateLineItem({
      lineId,
      quantity,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update item in cart" },
      { status: 500 }
    )
  }
}

