import bcrypt from "bcrypt";
import { prisma } from "@/lib/prismaDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing Fields" },
        { status: 400 }
      );
    }

    const formatedEmail = email.toLowerCase();

    try {
      const exist = await prisma.user.findUnique({
        where: {
          email: formatedEmail,
        },
      });

      if (exist) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
      }
    } catch (prismaError: any) {
      // If Prisma fails (e.g., DATABASE_URL missing), skip user check
      // User registration is optional for checkout
      console.warn("[Register API] Prisma error, skipping user check:", prismaError.message);
      return NextResponse.json(
        { success: false, message: "User registration is currently unavailable. You can still proceed with checkout." },
        { status: 503 }
      );
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    // Function to check if an email is in the list of admin emails
    function isAdminEmail(email: string) {
      return adminEmails.includes(email);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: formatedEmail,
      password: hashedPassword,
      role: "USER",
    };

    if (isAdminEmail(formatedEmail)) {
      newUser.role = "ADMIN";
    }

    try {
      const user = await prisma.user.create({
        data: {
          ...newUser,
        },
      });

      return NextResponse.json({ success: true, user });
    } catch (error: any) {
      console.error("[Register API] Error creating user:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Something went wrong" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Register API] Unhandled error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
