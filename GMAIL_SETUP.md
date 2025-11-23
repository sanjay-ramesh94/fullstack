# Gmail Setup for Email Notifications

Your application sends booking confirmation emails. Here's how to set it up:

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to https://myaccount.google.com
2. Click "Security" in the left sidebar
3. Scroll down to "2-Step Verification"
4. Click "Get Started"
5. Follow the prompts to enable 2FA (you'll need your phone)

## Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Google will show a 16-character password
5. **Copy this password** - you'll need it for deployment

## Step 3: Use in Deployment

When deploying to Render, use:
- **EMAIL_USER**: your full Gmail address (e.g., `pradeepkec12@gmail.com`)
- **EMAIL_PASS**: the 16-character app password from Step 2 (NOT your regular Gmail password)

## Example

```
EMAIL_USER=pradeepkec12@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Troubleshooting

### "Invalid login credentials" error
- Make sure you're using the app password, NOT your regular Gmail password
- Verify 2-factor authentication is enabled
- Check that you copied the entire 16-character password (including spaces)

### Emails not being sent
- Check backend logs in Render dashboard
- Verify EMAIL_USER and EMAIL_PASS are set correctly
- Test by creating a new booking

### "Less secure app access" error
- You don't need to enable "Less secure app access"
- Using app passwords is the recommended method
- If you see this error, you're using the wrong password type

## Security Notes

- Never commit your app password to GitHub
- Always use environment variables for sensitive data
- App passwords are specific to your account and can be revoked anytime
- You can generate multiple app passwords for different applications

