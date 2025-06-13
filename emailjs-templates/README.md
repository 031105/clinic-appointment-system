# EmailJS Templates - 2 Templates, 4 Purposes

This folder contains **2 multi-purpose EmailJS templates** that handle **4 different email types**.

## 🎯 Template Strategy

### Template 1: `EmailJS_Template_1_Multi_Purpose.html`
- **Template ID**: `template_hzt5pok`
- **Purple Theme** - Handles 2 purposes:
  - ✉️ **Email Verification** (shows verification code)
  - 🔔 **System Notifications** (shows notification cards)

### Template 2: `EmailJS_Template_2_Multi_Purpose.html`  
- **Template ID**: `template_01nl5co`
- **Blue Theme** - Handles 2 purposes:
  - 🔐 **Password Reset** (shows temporary password)
  - 📅 **Appointment Notifications** (shows appointment details)

## 🔧 How It Works

Each template uses **CSS display control** to show/hide different sections:
- Template 1: `show_verification` or `show_notification`
- Template 2: `show_password` or `show_appointment`

## 📧 Email Function Mapping

```javascript
// Template 1 functions
sendVerificationEmail()      → Template 1 (shows verification section)
sendSystemNotificationEmail() → Template 1 (shows notification section)

// Template 2 functions  
sendPasswordResetEmail()           → Template 2 (shows password section)
sendAppointmentNotificationEmail() → Template 2 (shows appointment section)
```

## 🚀 Setup Instructions

1. Copy HTML from `EmailJS_Template_1_Multi_Purpose.html`
2. Paste into EmailJS template `template_hzt5pok`
3. Copy HTML from `EmailJS_Template_2_Multi_Purpose.html`
4. Paste into EmailJS template `template_01nl5co`
5. Save both templates

✅ **Done!** Your system now handles 4 email types with just 2 templates! 