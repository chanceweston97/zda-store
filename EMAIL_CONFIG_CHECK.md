# Email Configuration Check for PrivateEmail.com

## Required Environment Variables

For the email to work properly with PrivateEmail.com, you need these environment variables in your `.env` file:

```env
# SMTP Server Configuration
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email@yourdomain.com
CONTACT_FORM_RECIPIENTS=recipient@example.com,another@example.com
```

## Configuration Details:

### 1. **EMAIL_SERVER_HOST** (line ~19)
- **Value**: `mail.privateemail.com`
- **Required**: No (has default)
- **Note**: This is the SMTP server hostname for PrivateEmail.com

### 2. **EMAIL_SERVER_PORT** (line ~20)
- **Value**: `587` (for TLS) or `465` (for SSL)
- **Required**: No (defaults to 587)
- **Note**: 
  - Port `587` = TLS (recommended)
  - Port `465` = SSL (if TLS doesn't work)

### 3. **EMAIL_SERVER_USER** (line ~21)
- **Value**: Your full email address (e.g., `sales@zdacomm.com`)
- **Required**: **YES** ⚠️
- **Note**: This is your PrivateEmail.com account email address

### 4. **EMAIL_SERVER_PASSWORD** (line ~22)
- **Value**: Your email account password or app-specific password
- **Required**: **YES** ⚠️
- **Note**: Use your PrivateEmail.com account password

### 5. **EMAIL_FROM** (line ~23)
- **Value**: Your email address (optional, defaults to EMAIL_SERVER_USER)
- **Required**: No
- **Note**: If not set, uses EMAIL_SERVER_USER

### 6. **CONTACT_FORM_RECIPIENTS**
- **Value**: Comma-separated list of email addresses to receive form submissions
- **Required**: No (has defaults)
- **Example**: `contact@zdacomm.com,sales@zdacomm.com`

## Common Issues:

### Issue 1: Port 587 not working
If port 587 doesn't work, try port 465:
```env
EMAIL_SERVER_PORT=465
```

### Issue 2: Authentication failed
- Make sure EMAIL_SERVER_USER is your full email address
- Make sure EMAIL_SERVER_PASSWORD is correct
- Some providers require app-specific passwords instead of regular passwords

### Issue 3: Connection timeout
- Check if port 587 or 465 is blocked by firewall
- Verify mail.privateemail.com is accessible
- Try using port 465 with SSL instead

## Testing Your Configuration:

After setting up the environment variables:

1. **Restart your Next.js server** (important - env vars only load on startup)
2. **Submit the contact form**
3. **Check server logs** - you should see:
   - `📧 Attempting to send email:` with your configuration
   - `✓ SMTP server connection verified` if connection works
   - `✅ Contact form email sent successfully` if email was sent
   - `❌ Failed to send contact form email:` with error details if it failed

## Quick Test:

You can check if your configuration is loaded by looking at server logs when the app starts. The email configuration will be logged (without password) when trying to send an email.

