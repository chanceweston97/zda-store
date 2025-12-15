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

    // Validate required fields
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

    // NOTE: Database storage removed (Prisma). Only sending email notification.
    const isContactForm = !productOrService || productOrService.trim() === "";
    
    let emailSent = false;
    let emailError: any = null;
    
    if (isContactForm) {
      // Check email configuration first
      if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
        console.error("❌ Email configuration missing");
        emailError = "Email server credentials are not configured.";
      } else {
        try {
          const recipientEmails = process.env.CONTACT_FORM_RECIPIENTS
            ? process.env.CONTACT_FORM_RECIPIENTS.split(',').map(email => email.trim()).filter(email => email.length > 0)
            : ["chanceweston97@gmail.com"];

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
                Note: Database storage has been removed. This email is the only record of this submission.
              </p>
            </div>
          `;

          const fromDomain = (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "").split("@")[1];
          const submitterDomain = email.trim().split("@")[1];
          const replyToAddress = submitterDomain === fromDomain 
            ? email.trim() 
            : (process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER);

          const emailResult = await sendEmail({
            to: recipientEmails,
            subject: emailSubject,
            html: emailHtml,
            replyTo: replyToAddress,
          });

          if (emailResult.accepted && emailResult.accepted.length > 0) {
            emailSent = true;
          } else if (emailResult.rejected && emailResult.rejected.length > 0) {
            emailError = `Email rejected: ${emailResult.rejected.join(", ")}`;
          } else {
            emailSent = true;
          }
        } catch (err: any) {
          emailError = err;
          console.error("❌ Failed to send contact form email:", err);
        }
      }
    }

    const responseData: any = { 
      message: "Quote request submitted successfully! (Note: Database storage has been removed)",
    };

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
    return NextResponse.json(
      { message: error.message || "Failed to submit quote request. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      quoteRequests: [],
      count: 0,
      message: "Quote requests are not available. Database (Prisma) has been removed."
    },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json(
    { 
      message: "Quote request deletion is not available. Database (Prisma) has been removed."
    },
    { status: 503 }
  );
}
