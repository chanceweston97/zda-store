import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function POST(request: any) {
  const body = await request.json();
  const { email, currentPassword, newPassword, id } = body;

  if (!email || !currentPassword || !newPassword) {
    return new NextResponse("Missing Fields", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json("Missing User", { status: 400 });
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user?.password!);

  if (!passwordMatch) {
    return NextResponse.json("Incorrect current password", { status: 401 });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      password: hashedNewPassword,
    },
  });

  return NextResponse.json("Password changed successfully", { status: 200 });
}
