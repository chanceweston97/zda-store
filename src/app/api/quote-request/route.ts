import { NextRequest, NextResponse } from "next/server";

/**
 * Quote Request API Route
 * Integrates with Contact Form 7 REST API (WordPress headless)
 * 
 * Endpoint: POST /wp-json/contact-form-7/v1/contact-forms/{FORM_ID}/feedback
 * CMS URL: cms.zdacomm.com
 * Route: /api/quote-request
 */

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Force reload - ensure Next.js picks up this route

// Get CMS URL and Form ID from environment variables
// NOTE: Form ID changed after migration - current correct ID is 3445
// Update CONTACT_FORM_7_QUOTE_ID environment variable to 3445
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://cms.zdacomm.com";
const CONTACT_FORM_7_QUOTE_ID = process.env.CONTACT_FORM_7_QUOTE_ID || "";

export async function POST(req: NextRequest) {
  try {
    // Log request details for debugging
    const contentType = req.headers.get("content-type");
    console.log("📥 Quote Request API Request:", {
      method: req.method,
      contentType: contentType,
      url: req.url,
    });

    // Validate environment configuration
    if (!CONTACT_FORM_7_QUOTE_ID) {
      console.error("❌ CONTACT_FORM_7_QUOTE_ID environment variable is not set");
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

    const { firstName, lastName, email, phone, productOrService, company, message } = body;

    // Validate required fields
    // CF7 form requires: your-name, your-email, your-tel, your-product, your-subject
    if (!firstName || !lastName || !email || !phone || !productOrService || !company) {
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

    // Contact Form 7 REST API endpoint for feedback
    // Note: We don't check form existence first because the feedback endpoint will validate it
    const feedbackEndpoint = `${CMS_URL}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_7_QUOTE_ID}/feedback`;

    // Prepare FormData for Contact Form 7
    // Contact Form 7 REST API expects multipart/form-data format
    // Field names must match your Contact Form 7 form fields exactly
    // CF7 form fields: your-name, your-email, your-tel, your-product, your-subject, your-message
    const formData = new FormData();
    
    // CF7 REQUIRES _wpcf7_unit_tag for spam protection and session tracking
    // Format: wpcf7-f{FORM_ID}-p{timestamp}-o1
    const unitTag = `wpcf7-f${CONTACT_FORM_7_QUOTE_ID}-p${Date.now()}-o1`;
    formData.append("_wpcf7_unit_tag", unitTag);
    
    // Combine firstName and lastName into your-name (CF7 expects single name field)
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    formData.append("your-name", fullName);
    
    formData.append("your-email", email.trim());
    formData.append("your-tel", phone.trim());
    
    // Product/Service of Interest - REQUIRED field (your-product)
    formData.append("your-product", productOrService.trim());
    
    // Company name maps to your-subject (required field)
    formData.append("your-subject", company.trim());
    
    // Message is optional
    if (message && message.trim()) {
      formData.append("your-message", message.trim());
    }

    console.log("📤 Sending to Contact Form 7:", {
      endpoint: feedbackEndpoint,
      formId: CONTACT_FORM_7_QUOTE_ID,
      fields: {
        "_wpcf7_unit_tag": unitTag,
        "your-name": fullName,
        "your-email": email.trim(),
        "your-tel": phone.trim(),
        "your-product": productOrService.trim(),
        "your-subject": company.trim(),
        "your-message": message || "(empty)",
      },
    });

    // POST to Contact Form 7 REST API
    // Contact Form 7 requires multipart/form-data
    // DO NOT set Content-Type header - FormData will set multipart/form-data with boundary automatically
    const response = await fetch(feedbackEndpoint, {
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
      console.log("✅ Quote request submission successful!");
      return NextResponse.json(
        { 
          message: data.message || "Quote request submitted successfully!",
          status: "success"
        },
        { status: 200 }
      );
    } else {
      // Handle Contact Form 7 validation errors or mail errors
      const errorMessage = data.message || "Failed to submit quote request. Please try again.";
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
    console.error("❌ Quote request submission error:", error);
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred. Please try again later.",
        status: "error"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { 
      quoteRequests: [],
      count: 0,
      message: "Quote requests are managed in WordPress Admin (Flamingo plugin). Use POST to submit a quote request."
    },
    { status: 200 }
  );
}
