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

// Get CMS URL and Form ID from environment variables
// NOTE: Form ID changed after migration - update CONTACT_FORM_7_CONTACT_ID with correct ID
// Based on schema, this form should be form ID 3445 (same as quote-request)
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

    const { firstName, lastName, email, phone, company, message, productOrService } = body;

    // Validate required fields (phone and company are now optional, but productOrService is required)
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { 
          message: "First name, last name, and email are required.",
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

    // Validate productOrService is required and not "Select one"
    if (!productOrService || productOrService.trim() === "" || productOrService.trim() === "Select one") {
      return NextResponse.json(
        { 
          message: "Please select a product or service.",
          status: "error"
        },
        { status: 400 }
      );
    }

    // ✅ Verify reCAPTCHA token (CRITICAL - must be done before sending to CF7)
    const { recaptchaToken } = body;
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

    // Only verify reCAPTCHA if secret key is configured
    if (RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        console.warn("⚠️ reCAPTCHA token missing but secret key is configured");
        return NextResponse.json(
          { 
            message: "reCAPTCHA verification is required.",
            status: "error"
          },
          { status: 400 }
        );
      }

      // Verify reCAPTCHA token with Google
      try {
        const verifyRes = await fetch(
          "https://www.google.com/recaptcha/api/siteverify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              secret: RECAPTCHA_SECRET_KEY,
              response: recaptchaToken,
            }),
          }
        );

        const verifyData = await verifyRes.json();

        // Handle browser-error specifically (usually means domain not registered or site key issue)
        if (verifyData["error-codes"] && verifyData["error-codes"].includes("browser-error")) {
          console.error("❌ reCAPTCHA browser-error - Check:", {
            issue: "Domain may not be registered in Google reCAPTCHA console",
            domain: "Make sure 'localhost' is added to allowed domains",
            siteKey: "Verify NEXT_PUBLIC_RECAPTCHA_SITE_KEY matches Google Console",
            errorCodes: verifyData["error-codes"],
          });
          return NextResponse.json(
            { 
              message: "reCAPTCHA configuration error. Please check domain settings.",
              status: "error"
            },
            { status: 403 }
          );
        }

        if (!verifyData.success || (verifyData.score !== undefined && verifyData.score < 0.5)) {
          console.error("❌ reCAPTCHA verification failed:", verifyData);
          return NextResponse.json(
            { 
              message: "reCAPTCHA verification failed. Please try again.",
              status: "error"
            },
            { status: 403 }
          );
        }

        console.log("✅ reCAPTCHA verification successful:", {
          success: verifyData.success,
          score: verifyData.score,
          action: verifyData.action,
        });
      } catch (recaptchaError: any) {
        console.error("❌ reCAPTCHA verification error:", recaptchaError);
        return NextResponse.json(
          { 
            message: "reCAPTCHA verification error. Please try again.",
            status: "error"
          },
          { status: 500 }
        );
      }
    } else {
      console.warn("⚠️ RECAPTCHA_SECRET_KEY not set - skipping reCAPTCHA verification (development mode)");
    }

    // Contact Form 7 REST API endpoint for feedback
    // Note: We don't check form existence first because the feedback endpoint will validate it
    const feedbackEndpoint = `${CMS_URL}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_7_CONTACT_ID}/feedback`;

    // Prepare FormData for Contact Form 7
    // Contact Form 7 REST API expects multipart/form-data format
    // Field names must match your Contact Form 7 form fields EXACTLY
    // CF7 form fields: first-name, last-name, your-email, your-subject, your-product, your-message
    const formData = new FormData();
    
    // CF7 REQUIRES _wpcf7_unit_tag for spam protection and session tracking
    // Format: wpcf7-f{FORM_ID}-p{timestamp}-o1
    const unitTag = `wpcf7-f${CONTACT_FORM_7_CONTACT_ID}-p${Date.now()}-o1`;
    formData.append("_wpcf7_unit_tag", unitTag);
    
    // First name - separate field (not combined)
    formData.append("first-name", firstName.trim());
    
    // Last name - separate field (not combined)
    formData.append("last-name", lastName.trim());
    
    // Email address
    formData.append("your-email", email.trim());
    
    // Company name (optional)
    formData.append("your-subject", company?.trim() || "");
    
    // Product/Service of Interest - REQUIRED field (dropdown)
    // CF7 expects the exact value from the dropdown options
    const productServiceValue = productOrService.trim();
    formData.append("your-product", productServiceValue);
    
    // Message (optional)
    formData.append("your-message", message?.trim() || "");
    
    console.log("📤 Sending to Contact Form 7:", {
      endpoint: feedbackEndpoint,
      formId: CONTACT_FORM_7_CONTACT_ID,
      fields: {
        "_wpcf7_unit_tag": unitTag,
        "first-name": firstName.trim(),
        "last-name": lastName.trim(),
        "your-email": email.trim(),
        "your-subject": company?.trim() || "",
        "your-product": productServiceValue,
        "your-message": message?.trim() || "",
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
        // Handle both string keys and numeric keys (CF7 sometimes returns numeric indices)
        const fieldErrors = Object.entries(data.invalid_fields)
          .map(([field, error]: [string, any]) => {
            // If error is an object with message property, use it
            if (error && typeof error === 'object' && error.message) {
              return error.message;
            }
            // If error is a string, use it directly
            if (typeof error === 'string') {
              return error;
            }
            // Otherwise, format as field: error
            return `${field}: ${error}`;
          })
          .filter(Boolean) // Remove empty strings
          .join(", ");
        
        // Only prepend "Validation error: " if we have field-specific errors
        if (fieldErrors) {
          userMessage = `Validation error: ${fieldErrors}`;
        }
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

