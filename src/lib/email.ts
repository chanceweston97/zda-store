type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

// Cache for Microsoft Graph API access token to avoid requesting a new one for every email
let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Microsoft Graph API access token using OAuth2 client credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  // Validate required environment variables
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
    throw new Error(
      "Microsoft Graph API credentials are not configured. Please set AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET environment variables."
    );
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to get access token:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();

    if (!tokenData.access_token) {
      throw new Error("Access token not found in response");
    }

    // Cache the token (expires in ~3600 seconds, cache for 3500 to be safe)
    const accessToken = tokenData.access_token as string;
    cachedAccessToken = accessToken;
    tokenExpiry = Date.now() + ((tokenData.expires_in || 3600) - 100) * 1000; // Subtract 100 seconds for safety

    console.log("✅ Microsoft Graph API access token obtained");
    return accessToken;
  } catch (error: any) {
    console.error("❌ Error getting access token:", error);
    throw new Error(`Failed to authenticate with Microsoft Graph API: ${error.message}`);
  }
}

/**
 * Send email using Microsoft Graph API
 */
export const sendEmail = async (data: EmailPayload) => {
  // Validate Microsoft Graph API configuration
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_SECRET) {
    throw new Error(
      "Microsoft Graph API credentials are not configured. Please set AZURE_CLIENT_ID, AZURE_TENANT_ID, and AZURE_CLIENT_SECRET environment variables."
    );
  }

  // Get the email address to send from (e.g., sales@zdacomm.com)
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER;
  if (!fromEmail) {
    throw new Error("EMAIL_FROM or EMAIL_SERVER_USER must be set to specify the sender email address.");
  }

  // Log configuration (without sensitive data)
  console.log("📧 Microsoft Graph API Email Configuration:", {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    fromEmail: fromEmail,
    hasClientSecret: !!process.env.AZURE_CLIENT_SECRET,
    server: "Microsoft Graph API",
  });

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Convert recipients to array if needed
    const recipients = Array.isArray(data.to) ? data.to : [data.to];

    // Prepare email message for Microsoft Graph API
    const message = {
      message: {
        subject: data.subject,
        body: {
          contentType: "HTML",
          content: data.html,
        },
        toRecipients: recipients.map((email) => ({
          emailAddress: {
            address: email.trim(),
          },
        })),
        ...(data.replyTo && {
          replyTo: [
            {
              emailAddress: {
                address: data.replyTo,
              },
            },
          ],
        }),
      },
    };

    // Send email using Microsoft Graph API
    const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(fromEmail)}/sendMail`;

    const response = await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || "Unknown error" };
      }

      console.error("❌ Failed to send email via Microsoft Graph API:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      throw new Error(
        `Failed to send email: ${response.status} ${response.statusText} - ${errorData.message || errorData.error?.message || "Unknown error"}`
      );
    }

    // Microsoft Graph API returns 202 Accepted on success (no body)
    console.log("✅ Email sent successfully via Microsoft Graph API:", {
      from: fromEmail,
      to: recipients,
      subject: data.subject,
    });

    // Return a result object similar to nodemailer format for compatibility
    return {
      messageId: `graph-${Date.now()}`,
      accepted: recipients,
      rejected: [],
      pending: [],
      response: `202 Accepted - Email sent via Microsoft Graph API`,
    };
  } catch (error: any) {
    console.error("❌ Email send failed:", {
      error: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
    throw error;
  }
};

export const formatEmail = (email: string) => {
  return email.replace(/\s+/g, "").toLowerCase().trim();
};

