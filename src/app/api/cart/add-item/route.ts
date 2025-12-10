import { addToCart } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variantId, quantity, countryCode } = body

    if (!variantId) {
      return NextResponse.json(
        { error: "Missing variant ID" },
        { status: 400 }
      )
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      )
    }

    if (!countryCode) {
      return NextResponse.json(
        { error: "Missing country code" },
        { status: 400 }
      )
    }

    const result = await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    return NextResponse.json({ success: true, cart: result })
  } catch (error: any) {
    console.error("========== ADD TO CART ERROR ==========")
    console.error("Error:", error)
    console.error("Error message:", error?.message)
    console.error("Error stack:", error?.stack)
    console.error("Error response:", error?.response)
    console.error("Error response data:", error?.response?.data)
    console.error("Error cause:", error?.cause)
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error("=======================================")
    
    // Provide more detailed error message
    const errorMessage = error?.message || 
                        error?.response?.data?.message || 
                        error?.response?.data?.error?.message ||
                        error?.cause?.message ||
                        String(error) ||
                        "Failed to add item to cart"
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          stack: error?.stack,
          response: error?.response?.data,
          cause: error?.cause
        } : undefined
      },
      { status: error?.response?.status || 500 }
    )
  }
}

