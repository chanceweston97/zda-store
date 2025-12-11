import { NextRequest, NextResponse } from "next/server";

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

    // Determine if this is a contact form (no productOrService) or quote request
    const isContactForm = !productOrService || productOrService.trim() === "";
    
    // Send email notification to backend
    let emailSent = false;
    let emailError: any = null;

    try {
      // Call backend API to send email
      const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
      
      // Note: This endpoint needs to be created in the backend
      // For now, we'll just log the request
      // You can create a backend API route at: backend/src/api/admin/quote-request/route.ts
      console.log("📧 Quote/Contact request received:", {
        firstName,
        lastName,
        email,
        phone,
        company,
        productOrService: productOrService || "N/A (Contact Form)",
        message: message || "N/A",
        isContactForm,
      });

      // Try to send email via backend if endpoint exists
      try {
        const emailResponse = await fetch(`${backendUrl}/admin/quote-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            productOrService: productOrService ? productOrService.trim() : "",
            company: company.trim(),
            message: message ? message.trim() : null,
            isContactForm,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log("✅ Email sent successfully via backend");
        } else {
          const errorData = await emailResponse.json().catch(() => ({}));
          emailError = errorData.message || "Failed to send email";
          console.error("❌ Failed to send email via backend:", emailError);
          // Still return success - form was submitted, just email failed
        }
      } catch (fetchError: any) {
        console.warn("⚠️ Backend email endpoint not available or failed:", fetchError.message);
        // Form submission still succeeds even if email fails
        emailError = "Email service temporarily unavailable, but your request was received";
      }
    } catch (err: any) {
      emailError = err.message || "Email service unavailable";
      console.error("❌ Error processing email:", err);
      // Don't fail the request if email fails - form submission still succeeds
    }

    const responseData: any = { 
      message: isContactForm 
        ? "Message sent successfully!" 
        : "Quote request submitted successfully!",
    };

    // Include email status in response for debugging
    if (isContactForm) {
      responseData.emailStatus = {
        sent: emailSent,
        error: emailError || null,
      };
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("Quote request error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}

