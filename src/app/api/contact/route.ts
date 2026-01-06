import { NextRequest, NextResponse } from "next/server";

/**
 * Contact Form API Route
 * Integrates with Contact Form 7 REST API (WordPress headless)
 * 
 * Endpoint: POST /wp-json/contact-form-7/v1/contact-forms/{FORM_ID}/feedback
 * CMS URL: cms.zdacomm.com
 */

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Get CMS URL and Form ID from environment variables
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://cms.zdacomm.com";
const CONTACT_FORM_7_CONTACT_ID = process.env.CONTACT_FORM_7_CONTACT_ID || "";

export async function POST(req: NextRequest) {
  try {
    // Log request details for debugging
    const contentType = req.headers.get("content-type");
    console.log("📥 Contact Form API Request:", {
      method: req.method,
      contentType: contentType,
      url: req.url,
    });

    // Validate environment configuration
    if (!CONTACT_FORM_7_CONTACT_ID) {
      console.error("❌ CONTACT_FORM_7_CONTACT_ID environment variable is not set");
      return NextResponse.json(
        { 
          message: "Server configuration error. Please contact support.",
          status: "error"
        },
        { status: 500 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { 
            message: "Request body is empty.",
            status: "error"
          },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError: any) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json(
        { 
          message: "Invalid JSON in request body. Please check your form data.",
          status: "error",
          error: parseError.message
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, company, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !company) {
      return NextResponse.json(
        { 
          message: "All required fields must be provided.",
          status: "error"
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { 
          message: "Please enter a valid email address.",
          status: "error"
        },
        { status: 400 }
      );
    }

    // Contact Form 7 REST API endpoint
    const cf7Endpoint = `${CMS_URL}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_7_CONTACT_ID}/feedback`;

    // Prepare FormData for Contact Form 7
    // Contact Form 7 REST API expects multipart/form-data format
    // Field names must match your Contact Form 7 form fields
    const formData = new FormData();
    // Contact form uses separate "first-name" and "last-name" fields
    formData.append("first-name", firstName.trim());
    formData.append("last-name", lastName.trim());
    formData.append("your-email", email.trim());
    // Contact form uses "your-tel" for phone number
    formData.append("your-tel", phone.trim());
    // Contact form uses "your-subject" for company name
    formData.append("your-subject", company.trim());
    if (message) {
      formData.append("your-message", message.trim());
    }

    console.log("📤 Sending to Contact Form 7:", {
      endpoint: cf7Endpoint,
      formId: CONTACT_FORM_7_CONTACT_ID,
      fields: {
        name: `${firstName} ${lastName}`,
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
      },
    });

    // POST to Contact Form 7 REST API
    // Contact Form 7 requires multipart/form-data
    // DO NOT set Content-Type header - FormData will set multipart/form-data with boundary automatically
    const response = await fetch(cf7Endpoint, {
      method: "POST",
      body: formData,
    });

    // Parse response - Contact Form 7 returns JSON
    let data;
    try {
      const responseText = await response.text();
      console.log("📥 Contact Form 7 Response:", {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500),
      });
      
      if (!responseText) {
        throw new Error("Empty response from Contact Form 7");
      }
      data = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error("❌ Failed to parse Contact Form 7 response:", parseError);
      return NextResponse.json(
        { 
          message: "Invalid response from server. Please try again.",
          status: "error"
        },
        { status: 500 }
      );
    }

    // Log full response for debugging
    console.log("📋 Contact Form 7 Full Response:", JSON.stringify(data, null, 2));

    // Contact Form 7 returns status in the response
    if (response.ok && data.status === "mail_sent") {
      // Success - email sent and saved in Flamingo
      console.log("✅ Contact form submission successful!");
      return NextResponse.json(
        { 
          message: data.message || "Contact form submitted successfully!",
          status: "success"
        },
        { status: 200 }
      );
    } else {
      // Handle Contact Form 7 validation errors or mail errors
      const errorMessage = data.message || "Failed to submit contact form. Please try again.";
      console.error("❌ Contact Form 7 error:", {
        httpStatus: response.status,
        cf7Status: data.status,
        message: data.message,
        invalidFields: data.invalid_fields,
        code: data.code,
        fullResponse: data,
      });

      // Provide more helpful error message
      let userMessage = errorMessage;
      if (data.invalid_fields && Object.keys(data.invalid_fields).length > 0) {
        const fieldErrors = Object.entries(data.invalid_fields)
          .map(([field, error]: [string, any]) => `${field}: ${error.message || error}`)
          .join(", ");
        userMessage = `Validation error: ${fieldErrors}`;
      }

      return NextResponse.json(
        { 
          message: userMessage,
          status: "error",
          details: data.invalid_fields || undefined,
          cf7Status: data.status,
        },
        { status: response.status || 400 }
      );
    }
  } catch (error: any) {
    console.error("❌ Contact form submission error:", error);
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred. Please try again later.",
        status: "error"
      },
      { status: 500 }
    );
  }
}

