# PrivateEmail.com Setup Guide

## Configuration for PrivateEmail.com

PrivateEmail.com (by Namecheap) has specific requirements for SMTP:

### Required Environment Variables

Add these to your `.env` file:

```env
# PrivateEmail.com SMTP Configuration
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-privateemail-password
EMAIL_FROM=your-email@yourdomain.com
CONTACT_FORM_RECIPIENTS=chanceweston97@gmail.com
```

### Important Notes for PrivateEmail.com:

1. **From Address Must Match User**
   - The `EMAIL_FROM` must match `EMAIL_SERVER_USER`
   - PrivateEmail.com will reject emails if the "From" address doesn't match the authenticated account
   - Example: If `EMAIL_SERVER_USER=sales@zdacomm.com`, then `EMAIL_FROM` should also be `sales@zdacomm.com`

2. **Port Options:**
   - **Port 587** (TLS/STARTTLS) - Recommended, default
   - **Port 465** (SSL) - Use if 587 doesn't work
   - Change `EMAIL_SERVER_PORT=465` if you get connection errors on 587

3. **Authentication:**
   - Username: Your full PrivateEmail.com email address (e.g., `sales@zdacomm.com`)
   - Password: Your PrivateEmail.com account password

4. **Server:**
   - Host: `mail.privateemail.com` (already configured)

### Testing Your Configuration:

1. **Set up `.env` file** with your PrivateEmail.com credentials
2. **Restart your Next.js server** (env vars only load on startup)
3. **Submit the contact form**
4. **Check server logs** for:
   - `📧 PrivateEmail.com SMTP Configuration:` - Shows your config
   - `✓ SMTP server connection verified` - Connection successful
   - `Email send attempt completed:` - Check `accepted` array

### Common Issues:

#### Issue 1: "Sender address rejected"
**Solution:** Make sure `EMAIL_FROM` matches `EMAIL_SERVER_USER` exactly

#### Issue 2: Connection timeout on port 587
**Solution:** Try port 465 instead:
```env
EMAIL_SERVER_PORT=465
```

#### Issue 3: Authentication failed
**Solution:** 
- Verify your email address and password are correct
- Make sure you're using your PrivateEmail.com account password (not your domain/hosting password)
- Check if your PrivateEmail.com account is active

#### Issue 4: Email accepted but not received
**Solution:**
- Check spam/junk folder in Gmail
- Check PrivateEmail.com webmail "Sent" folder to see if email was sent
- Verify recipient email address is correct

### Example `.env` Configuration:

```env
# PrivateEmail.com Account
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=sales@zdacomm.com
EMAIL_SERVER_PASSWORD=your-actual-password-here
EMAIL_FROM=sales@zdacomm.com
CONTACT_FORM_RECIPIENTS=chanceweston97@gmail.com
```

**Important:** Replace `sales@zdacomm.com` with your actual PrivateEmail.com email address and `your-actual-password-here` with your actual password.

