import { prisma } from "@/lib/prismaDB";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: "Invalid request body. Please check your form data." },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, productOrService, company, message } = body;

    // Validate required fields (productOrService is optional for product detail pages)
    if (!firstName || !lastName || !email || !phone || !company) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
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

    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productOrService: productOrService ? productOrService.trim() : "",
        company: company.trim(),
        message: message ? message.trim() : null,
        status: "pending",
      },
    });

    // Send email notification for contact form submissions (when productOrService is empty)
    const isContactForm = !productOrService || productOrService.trim() === "";
    
    let emailSent = false;
    let emailError: any = null;
    
    if (isContactForm) {
      // Check email configuration first
      if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error("❌ Email configuration missing:", {
          hasUser: !!process.env.EMAIL_SERVER_USER,
          hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
          host: process.env.EMAIL_SERVER_HOST || "mail.privateemail.com",
          port: process.env.EMAIL_SERVER_PORT || "587",
        });
        emailError = "Email server credentials are not configured. Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in your .env file.";
      } else {
        console.log("✅ Email configuration found:", {
          hasUser: !!process.env.EMAIL_SERVER_USER,
          hasPassword: !!process.env.EMAIL_SERVER_PASSWORD,
          host: process.env.EMAIL_SERVER_HOST || "mail.privateemail.com",
          port: process.env.EMAIL_SERVER_PORT || "587",
          from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
        });
        try {
          // Get recipient emails from environment variable or use default
          // Contact form always sends to chanceweston97@gmail.com
          const recipientEmails = process.env.CONTACT_FORM_RECIPIENTS
            ? process.env.CONTACT_FORM_RECIPIENTS.split(',').map(email => email.trim()).filter(email => email.length > 0)
            : ["chanceweston97@gmail.com"]; // Default recipient for contact form

          console.log("📬 Email recipients:", recipientEmails);
          console.log("📬 Email will be sent FROM:", process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER);

          // Escape HTML to prevent XSS attacks
          const escapeHtml = (text: string) => {
            return text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          };

          const emailSubject = `New Contact Form Submission from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2958A4;">New Contact Form Submission</h2>
              <div style="background-color: #f4f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
                <p><strong>Company:</strong> ${escapeHtml(company)}</p>
                <p><strong>Message:</strong><br>${message ? escapeHtml(message).replace(/\n/g, '<br>') : 'No message provided'}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This email was sent from the contact form on your website.
              </p>
            </div>
          `;

          console.log("📧 Attempting to send email:", {
            from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
            to: recipientEmails,
            host: process.env.EMAIL_SERVER_HOST || "mail.privateemail.com",
            port: process.env.EMAIL_SERVER_PORT || "587",
          });

          // PrivateEmail.com requires Reply-To to be from the same domain as From
          // If the form submitter's email is from a different domain, use the From address instead
          const fromDomain = (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "").split("@")[1];
          const submitterDomain = email.trim().split("@")[1];
          const replyToAddress = submitterDomain === fromDomain 
            ? email.trim() 
            : (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER);

          console.log("📧 Reply-To configuration:", {
            submitterEmail: email.trim(),
            submitterDomain: submitterDomain,
            fromDomain: fromDomain,
            replyToAddress: replyToAddress,
            reason: submitterDomain === fromDomain ? "Same domain - using submitter email" : "Different domain - using From address",
          });

          const emailResult = await sendEmail({
            to: recipientEmails,
            subject: emailSubject,
            html: emailHtml,
            replyTo: replyToAddress,
          });

          // Check if email was actually accepted by the server
          if (emailResult.accepted && emailResult.accepted.length > 0) {
            emailSent = true;
            console.log("✅ Email accepted by server:", {
              messageId: emailResult.messageId,
              accepted: emailResult.accepted,
              rejected: emailResult.rejected || [],
              response: emailResult.response,
            });
          } else if (emailResult.rejected && emailResult.rejected.length > 0) {
            emailError = `Email rejected: ${emailResult.rejected.join(", ")}`;
            console.error("❌ Email rejected by server:", {
              rejected: emailResult.rejected,
              response: emailResult.response,
            });
          } else {
            emailSent = true;
            console.log("✅ Email sent (check delivery status):", {
              messageId: emailResult.messageId,
              accepted: emailResult.accepted || [],
              rejected: emailResult.rejected || [],
            });
          }
        } catch (err: any) {
          emailError = err;
          console.error("❌ Failed to send contact form email:", {
            error: err.message,
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode,
            stack: err.stack,
          });
        }
      }
    }

    const responseData: any = { 
      message: "Quote request submitted successfully!",
      id: quoteRequest.id 
    };

    // Include email status in response for debugging (always include for contact forms)
    if (isContactForm) {
      responseData.emailStatus = {
        sent: emailSent,
        error: emailError ? emailError.message || String(emailError) : null,
        configured: !!(process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD),
      };
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Quote request error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "A quote request with this information already exists" },
        { status: 409 }
      );
    }
    
    // Handle Prisma schema mismatch errors
    if (error.message?.includes("Unknown argument") || error.message?.includes("Unknown field")) {
      console.error("Prisma schema mismatch detected. Please run: npx prisma generate && npx prisma migrate dev");
      return NextResponse.json(
        { message: "Database schema error. Please contact support." },
        { status: 500 }
      );
    }
    
    // Handle database connection errors
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        { message: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || "Failed to submit quote request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const quoteRequests = await prisma.quoteRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { quoteRequests, count: quoteRequests.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching quote requests:", error);
    
    return NextResponse.json(
      { message: "Failed to fetch quote requests", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Quote request ID is required" },
        { status: 400 }
      );
    }

    // Delete the quote request
    await prisma.quoteRequest.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Quote request deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting quote request:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Quote request not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to delete quote request", error: error.message },
      { status: 500 }
    );
  }
}

