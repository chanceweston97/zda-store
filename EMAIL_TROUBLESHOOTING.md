# Email Troubleshooting Guide

## Issue: Email Shows "Sent Successfully" But Not Received

If your server logs show "✅ Email sent successfully" but you're not receiving emails, here's how to fix it:

### Step 1: Check Server Logs

After submitting the form, look for these log entries:

```
📬 Email recipients: [array of email addresses]
📬 Email will be sent FROM: your-email@domain.com
📧 Attempting to send email: {...}
Email send attempt completed: {
  messageId: "...",
  accepted: [...],  // ← Check if your email is here
  rejected: [...],  // ← Check if your email is here
  response: "..."
}
```

**If `rejected` array has emails**, those addresses were rejected by the SMTP server.

**If `accepted` is empty**, no emails were accepted.

### Step 2: Common Issues & Fixes

#### Issue A: Email in Spam/Junk Folder
**Solution:**
1. Check your spam/junk folder in Gmail
2. Mark it as "Not Spam" if found
3. Add the sender email to your contacts

#### Issue B: Gmail Blocking Emails
Gmail may block emails if:
- The "from" address isn't properly authenticated
- SPF/DKIM records aren't set up correctly
- The sending domain has poor reputation

**Solution:**
1. Use an email address from your own domain (not PrivateEmail.com)
2. Set up SPF/DKIM records for your domain in PrivateEmail.com settings
3. Verify the domain in PrivateEmail.com

#### Issue C: Wrong Recipient Address
The email might be going to a different address than expected.

**Check:**
1. Look at server logs for `📬 Email recipients:`
2. Verify the addresses match what you expect
3. Make sure `CONTACT_FORM_RECIPIENTS` environment variable is set correctly

#### Issue D: Email Server Rejecting Messages
The SMTP server might be rejecting emails silently.

**Solution:**
1. Check if PrivateEmail.com account has sending limits
2. Verify account isn't suspended
3. Check if password is correct
4. Try using port 465 with SSL instead of 587 with TLS

### Step 3: Test Configuration

Update your `.env` file:

```env
# Make sure these are set correctly
EMAIL_SERVER_USER=your-actual-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-actual-password
EMAIL_FROM=your-actual-email@yourdomain.com
CONTACT_FORM_RECIPIENTS=chanceweston97@gmail.com
```

### Step 4: Verify Email Delivery

1. **Check PrivateEmail.com account:**
   - Log into your PrivateEmail.com webmail
   - Check "Sent" folder - is the email there?
   - Check for any bounce-back messages

2. **Check Gmail:**
   - Check Spam/Junk folder
   - Check "All Mail" folder
   - Search for the subject line or sender email

3. **Check server logs:**
   - Look for `accepted` array - should contain recipient email
   - Look for `rejected` array - should be empty
   - Look for any error messages

### Step 5: Alternative Solutions

If emails still don't arrive:

1. **Use a different email service:**
   - SendGrid
   - Mailgun
   - Resend
   - AWS SES

2. **Check PrivateEmail.com settings:**
   - Ensure SMTP is enabled
   - Check sending limits
   - Verify account status

3. **Test with a different recipient:**
   - Try sending to a different email address
   - Test with your own domain email if possible

### Step 6: Check Logs for Actual Status

After the update, server logs will show:

```
Email send attempt completed: {
  accepted: ['chanceweston97@gmail.com'],  // ← Should have your email
  rejected: [],  // ← Should be empty
  messageId: '...',
  response: '250 OK: queued as ...'
}
```

**If `accepted` has your email** → Email was accepted by SMTP server (check spam)
**If `rejected` has your email** → Email was rejected (check address/domain)
**If both are empty** → Something is wrong with SMTP configuration

