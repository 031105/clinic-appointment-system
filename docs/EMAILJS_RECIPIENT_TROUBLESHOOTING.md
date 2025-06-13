# 📧 EmailJS Recipient Troubleshooting Guide

## 🚨 Issue: Emails Going to Wrong Recipient

If emails are being sent to the sender's email instead of the user's email, follow this troubleshooting guide.

## ✅ Step 1: Verify Frontend Code (ALREADY FIXED)

The frontend code has been updated with enhanced logging and validation:

```javascript
// The code now properly sets the recipient email
const emailParams = {
  to_email: recipientEmail, // *** This is the actual recipient ***
  to_name: params.to_name,
  // ... other parameters
};
```

## 🔍 Step 2: Check EmailJS Template Configuration

The issue is likely in the **EmailJS template configuration**. Follow these steps:

### 2.1 Login to EmailJS Dashboard
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Login with your account
3. Navigate to **Templates**

### 2.2 Check Template `template_01nl5co` (Password Reset)
1. Click on template `template_01nl5co`
2. **CRITICAL**: In the template settings, verify the **"To Email"** field
3. The "To Email" field should be set to: `{{to_email}}`
4. **NOT** your personal email address or any hardcoded email

### Expected Template Configuration:
```
To Email: {{to_email}}
To Name: {{to_name}}
Subject: {{subject}}
```

### 2.3 Check Template Content
Make sure the template HTML uses the correct variables:
- `{{to_email}}` for recipient email
- `{{to_name}}` for recipient name

## 🔧 Step 3: Check EmailJS Service Configuration

### 3.1 Verify Service Settings
1. Go to **Services** in EmailJS dashboard
2. Click on your service (`service_zdk8m9i`)
3. Check **Service Settings**
4. Ensure no email override is set

### 3.2 Check Email Service Provider
Different email providers have different configurations:
- **Gmail**: Should work with proper authentication
- **Outlook**: May have additional restrictions
- **Custom SMTP**: Check sender/reply-to settings

## 🧪 Step 4: Test with Debug Functions

Use the new debugging functions in the application:

### 4.1 Test Email Delivery
1. Go to `/test-email` page
2. Enter a test email address
3. Click **"🎯 Test Email Delivery (Debug Recipients)"**
4. Check browser console for detailed logs
5. Verify the email arrives at the correct recipient

### 4.2 Check Console Logs
Look for these logs in browser console:
```
[EmailJS] Sending password reset email TO: user@example.com
[EmailJS] Recipient name: John Doe
[EmailJS] Service ID: service_zdk8m9i
[EmailJS] Template ID: template_01nl5co
```

## 🔍 Step 5: Verify EmailJS Dashboard Template Settings

### Critical Settings to Check:

1. **Template ID**: `template_01nl5co`
2. **To Email Field**: Must be `{{to_email}}`
3. **Service Association**: Linked to correct service
4. **Template Status**: Active/Published

### Template Settings Screenshot Guide:
```
┌─────────────────────────────────────┐
│ Template Settings                    │
├─────────────────────────────────────┤
│ To Email: {{to_email}}              │ ← MUST BE THIS
│ To Name:  {{to_name}}               │
│ Subject:  {{subject}}               │
│ Reply To: (optional)                │
└─────────────────────────────────────┘
```

## ⚠️ Common Mistakes

### ❌ WRONG - Template configured with fixed email:
```
To Email: your-email@gmail.com  ← This sends to you always
```

### ✅ CORRECT - Template configured with variable:
```
To Email: {{to_email}}  ← This sends to the recipient
```

## 🚀 Step 6: Quick Fix Checklist

- [ ] EmailJS template `template_01nl5co` has `{{to_email}}` in "To Email" field
- [ ] Template is published and active
- [ ] Service is properly configured
- [ ] Frontend logs show correct recipient email
- [ ] Test email delivery function works
- [ ] No email overrides in service settings

## 📞 Step 7: Contact Support

If the issue persists after checking all above:

1. **EmailJS Support**: Contact EmailJS support with:
   - Service ID: `service_zdk8m9i`
   - Template ID: `template_01nl5co`
   - Description of the issue

2. **Application Support**: Check application logs for:
   - Console error messages
   - Network request failures
   - EmailJS API responses

## 🎯 Testing Commands

Use these in browser console for additional debugging:

```javascript
// Check EmailJS configuration
import { validateEmailJSConfig } from '@/utils/emailjs';
validateEmailJSConfig();

// Test specific email delivery
import { testEmailDelivery } from '@/utils/emailjs';
testEmailDelivery('test@example.com', 'Test User');
```

## 📈 Success Indicators

You'll know the issue is fixed when:
- Console logs show: `[EmailJS] Password reset email sent successfully`
- Test emails arrive at the specified recipient
- Production password reset emails go to correct users
- No emails arrive at the sender's address

---

**Last Updated**: December 2024  
**Status**: Enhanced with debugging functions and validation 