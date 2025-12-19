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

    // NOTE: Database storage removed (Prisma). Only sending email notification via Microsoft Graph API.
    const isContactForm = !productOrService || productOrService.trim() === "";
    
    let emailSent = false;
    let emailError: any = null;
    
    // Check Microsoft Graph API configuration (for both contact and quote forms)
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
      console.error("❌ Microsoft Graph API configuration missing");
      emailError = "Microsoft Graph API credentials are not configured. Please set AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET.";
    } else {
      try {
        // Get admin email from env (same for both contact and quote forms)
        const recipientEmails = process.env.ADMIN_EMAIL
          ? [process.env.ADMIN_EMAIL]
          : (process.env.CONTACT_FORM_RECIPIENTS
              ? process.env.CONTACT_FORM_RECIPIENTS.split(',').map(email => email.trim()).filter(email => email.length > 0)
              : [process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || ""]);

        if (!recipientEmails[0]) {
          throw new Error("ADMIN_EMAIL, CONTACT_FORM_RECIPIENTS, or EMAIL_FROM must be set");
        }

        const escapeHtml = (text: string) => {
          return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        // Different email templates for contact vs quote request
        let emailSubject: string;
        let emailHtml: string;

        if (isContactForm) {
          emailSubject = `New Contact Form Submission from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
          emailHtml = `
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
        } else {
          emailSubject = `New Quote Request from ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2958A4;">New Quote Request</h2>
              <div style="background-color: #f4f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
                <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
                <p><strong>Company:</strong> ${escapeHtml(company)}</p>
                <p><strong>Product/Service:</strong> ${escapeHtml(productOrService)}</p>
                <p><strong>Message:</strong><br>${message ? escapeHtml(message).replace(/\n/g, '<br>') : 'No message provided'}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This email was sent from the quote request form on your website.
              </p>
            </div>
          `;
        }

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
          console.log(`✅ Email sent successfully via Microsoft Graph API to: ${recipientEmails.join(", ")}`);
        } else if (emailResult.rejected && emailResult.rejected.length > 0) {
          emailError = `Email rejected: ${emailResult.rejected.join(", ")}`;
        } else {
          emailSent = true;
        }
      } catch (err: any) {
        emailError = err;
        console.error(`❌ Failed to send ${isContactForm ? 'contact form' : 'quote request'} email:`, err);
      }
    }

    const responseData: any = { 
      message: isContactForm 
        ? "Contact form submitted successfully!" 
        : "Quote request submitted successfully!",
    };

    // Always include email status for both forms
    responseData.emailStatus = {
      sent: emailSent,
      error: emailError ? emailError.message || String(emailError) : null,
      configured: !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_SECRET),
    };

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
