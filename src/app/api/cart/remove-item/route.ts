import { deleteLineItem } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lineId } = body

    if (!lineId) {
      return NextResponse.json(
        { error: "Missing lineId" },
        { status: 400 }
      )
    }

    await deleteLineItem(lineId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { error: error.message || "Failed to remove item from cart" },
      { status: 500 }
    )
  }
}

