  import { NextRequest, NextResponse } from "next/server";

  /**
   * Newsletter Subscription API Route
   * Integrates with Contact Form 7 REST API (WordPress headless)
   * 
   * Endpoint: POST /wp-json/contact-form-7/v1/contact-forms/{FORM_ID}/feedback
   * CMS URL: admin.zdacomm.com
   */

  // Route segment config
  export const runtime = 'nodejs';

  // Get CMS URL and Form ID from environment variables
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://admin.zdacomm.com";
  const CONTACT_FORM_7_NEWSLETTER_ID = process.env.CONTACT_FORM_7_NEWSLETTER_ID || "";

  export async function GET(req: NextRequest) {
    return NextResponse.json(
      {
        subscribers: [],
        count: 0,
        message: "Subscribers are managed in WordPress Admin (Flamingo plugin). Use POST to subscribe."
      },
      { status: 200 }
    );
  }

  export async function POST(req: NextRequest) {
    try {
      const contentType = req.headers.get("content-type");
      console.log("📥 Newsletter API Request:", {
        method: req.method,
        contentType: contentType,
        url: req.url,
        hasBody: !!req.body,
      });

      if (!CONTACT_FORM_7_NEWSLETTER_ID) {
        console.error("❌ CONTACT_FORM_7_NEWSLETTER_ID environment variable is not set");
        return NextResponse.json(
          {
            message: "Server configuration error. Please contact support.",
            status: "error"
          },
          { status: 500 }
        );
      }

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

      const { email, turnstileResponse, recaptchaToken } = body;

      if (!email || !email.trim()) {
        return NextResponse.json(
          {
            message: "Email address is required.",
            status: "error"
          },
          { status: 400 }
        );
      }

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
      const feedbackEndpoint = `${CMS_URL}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_7_NEWSLETTER_ID}/feedback`;

      // Prepare FormData for Contact Form 7
      // Contact Form 7 REST API expects multipart/form-data format
      // CF7 REQUIRES _wpcf7_unit_tag for spam protection and session tracking
      // Format: wpcf7-f{FORM_ID}-p{timestamp}-o1
      const formData = new FormData();
      formData.append("_wpcf7_unit_tag", `wpcf7-f${CONTACT_FORM_7_NEWSLETTER_ID}-p${Date.now()}-o1`);
      formData.append("your-email", email.trim());
      // If form uses Turnstile/reCAPTCHA in CF7, WordPress returns "Unauthorized source" unless we send the token.
      // Frontend can pass turnstileResponse → cf-turnstile-response, or recaptchaToken → g-recaptcha-response.
      if (turnstileResponse && typeof turnstileResponse === "string" && turnstileResponse.trim()) {
        formData.append("cf-turnstile-response", turnstileResponse.trim());
      }
      if (recaptchaToken && typeof recaptchaToken === "string" && recaptchaToken.trim()) {
        formData.append("g-recaptcha-response", recaptchaToken.trim());
      }

      console.log("📤 Sending to Contact Form 7:", {
        endpoint: feedbackEndpoint,
        formId: CONTACT_FORM_7_NEWSLETTER_ID,
        email: email.trim(),
      });

      // POST to Contact Form 7 REST API
      // Contact Form 7 requires multipart/form-data
      // DO NOT set Content-Type header - FormData will set multipart/form-data with boundary automatically
      // Send Origin and Referer matching the CMS so CF7's "Invalid origin" check accepts server-side requests
      const response = await fetch(feedbackEndpoint, {
        method: "POST",
        body: formData,
        headers: {
          Origin: CMS_URL,
          Referer: `${CMS_URL}/`,
        },
      });

      let data;
      const responseText = await response.text();
      console.log("📥 Contact Form 7 Response Status:", response.status);
      console.log("📥 Contact Form 7 Response Headers:", Object.fromEntries(response.headers.entries()));
      console.log("📥 Contact Form 7 Response Body:", responseText.substring(0, 500));

      try {
        if (!responseText) {
          throw new Error("Empty response from Contact Form 7");
        }
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error("❌ Failed to parse Contact Form 7 response:", parseError);
        return NextResponse.json(
          {
            message: "Invalid response from server. Please try again.",
            status: "error",
            rawResponse: responseText,
          },
          { status: 500 }
        );
      }

      console.log("📋 Contact Form 7 Full Response:", data);

      if (response.ok && data.status === "mail_sent") {
        return NextResponse.json(
          {
            message: data.message || "Successfully subscribed to newsletter!",
            status: "success"
          },
          { status: 200 }
        );
      } else {
        const errorMessage = data.message || "Failed to subscribe. Please try again.";
        console.error("❌ Contact Form 7 error:", {
          httpStatus: response.status,
          cf7Status: data.status,
          message: data.message,
          invalidFields: data.invalid_fields,
          code: data.code,
          fullResponse: data,
        });

        return NextResponse.json(
          {
            message: errorMessage,
            status: "error",
            details: data.invalid_fields || undefined
          },
          { status: response.status || 400 }
        );
      }
    } catch (error: any) {
      console.error("❌ Newsletter subscription error:", error);
      return NextResponse.json(
        {
          message: error.message || "An unexpected error occurred. Please try again later.",
          status: "error"
        },
        { status: 500 }
      );
    }
  }
