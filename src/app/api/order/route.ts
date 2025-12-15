import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prismaDB";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userEmail: session?.user?.email,
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
  }

  try {
    // update the order
    const body = await req.json();
    const { id, status } = body;

    console.log(id, status);

    if (!id || !status) {
      return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
