import { prisma } from "@/lib/prismaDB";
import { NextRequest, NextResponse } from "next/server";
import { validateDatabaseUrl, getDatabaseConnectionInfo } from "@/lib/db-connection-check";

export async function GET(req: NextRequest) {
  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { subscribers, count: subscribers.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    
    // Check for database connection errors
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      const connectionInfo = getDatabaseConnectionInfo();
      const validation = validateDatabaseUrl();
      
      let errorMessage = "Database connection failed. ";
      
      if (!connectionInfo.hasUrl) {
        errorMessage += "DATABASE_URL environment variable is not set.";
      } else if (connectionInfo.isPrismaAccelerate) {
        // Prisma Accelerate should work, but if it's failing, there might be an API key issue
        errorMessage += "Using Prisma Accelerate but connection failed. Please verify your Prisma Accelerate API key is valid and the service is active.";
      } else if (connectionInfo.isDirect && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
        errorMessage += `You're using a direct connection (port ${connectionInfo.port}) in production. Please update DATABASE_URL in your hosting platform (Vercel) to use either: (1) Supabase connection pooler URL (port 6543, pooler.supabase.com), or (2) Prisma Accelerate URL (prisma+postgres://accelerate.prisma-data.net/...). Current connection type detected: ${connectionInfo.isDirect ? 'Direct' : connectionInfo.isPooler ? 'Pooler' : connectionInfo.isPrismaAccelerate ? 'Prisma Accelerate' : 'Unknown'}`;
      } else {
        errorMessage += validation.message || "Please check your database configuration.";
      }
      
      return NextResponse.json(
        { 
          message: errorMessage,
          error: "Database connection error",
          connectionInfo: process.env.NODE_ENV === "development" ? connectionInfo : undefined
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to fetch subscribers", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    const formattedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: {
        email: formattedEmail,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already subscribed" },
        { status: 409 }
      );
    }

    // Create newsletter subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email: formattedEmail,
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // More detailed error message
    let errorMessage = "Internal Server Error";
    let statusCode = 500;
    
    // Database connection errors
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      const connectionInfo = getDatabaseConnectionInfo();
      const validation = validateDatabaseUrl();
      
          errorMessage = "Database connection failed. ";
          
          if (!connectionInfo.hasUrl) {
            errorMessage += "DATABASE_URL environment variable is not set.";
          } else if (connectionInfo.isPrismaAccelerate) {
            // Prisma Accelerate should work, but if it's failing, there might be an API key issue
            errorMessage += "Using Prisma Accelerate but connection failed. Please verify your Prisma Accelerate API key is valid and the service is active.";
          } else if (connectionInfo.isDirect && (process.env.VERCEL || process.env.NODE_ENV === "production")) {
            errorMessage += `You're using a direct connection (port ${connectionInfo.port}) in production. Please update DATABASE_URL in your hosting platform (Vercel) to use either: (1) Supabase connection pooler URL (port 6543, pooler.supabase.com), or (2) Prisma Accelerate URL (prisma+postgres://accelerate.prisma-data.net/...). Current connection type detected: ${connectionInfo.isDirect ? 'Direct' : connectionInfo.isPooler ? 'Pooler' : connectionInfo.isPrismaAccelerate ? 'Prisma Accelerate' : 'Unknown'}`;
          } else {
            errorMessage += validation.message || "Please check your database configuration.";
          }
      
      statusCode = 503;
    } else if (error.code === "P6008") {
      errorMessage = "Database connection failed. Please check your database configuration.";
      statusCode = 503;
    } else if (error.code === "P2002") {
      // Unique constraint violation (duplicate email)
      errorMessage = "Email already subscribed";
      statusCode = 409;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    );
  }
}

