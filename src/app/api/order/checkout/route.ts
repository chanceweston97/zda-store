import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderId,
      status,
      totalPrice,
      userId,
      userEmail,
      productQuantity,
      orderTitle,
      country,
      city,
      postalCode,
      line1,
      line2,
      products,
    } = body;

    // Basic validation
    if (
      !orderId ||
      !status ||
      !userEmail ||
      !productQuantity ||
      !country ||
      !city ||
      !products
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order in Prisma database
    const order = await prisma.order.create({
      data: {
        orderId,
        status,
        totalPrice,
        userId,
        userEmail,
        productQuantity,
        orderTitle,
        country,
        city,
        postalCode,
        line1,
        line2,
        products,
      },
    });

    console.log("Order created in database:", orderId);

    return NextResponse.json(
      { success: true, message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error?.stack || error, "error in create order route");
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}