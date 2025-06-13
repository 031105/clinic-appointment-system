import emailjs from '@emailjs/browser';

// EmailJS configuration from environment variables
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

// Initialize EmailJS
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

export interface EmailVerificationParams {
  to_email: string;
  to_name: string;
  otp_code: string;
}

export interface PasswordResetParams {
  to_email: string;
  to_name: string;
  temp_password: string;
  reset_link?: string;
}

export interface SystemNotificationParams {
  to_email: string;
  to_name: string;
  notification_title: string;
  notification_message: string;
  notification_type: 'system' | 'reminder' | 'message' | 'appointment';
  notification_date?: string;
}

export interface AppointmentNotificationParams {
  to_email: string;
  to_name: string;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  department: string;
  notification_type: 'booking_confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  appointment_id?: string;
  additional_notes?: string;
}

/**
 * Send email verification OTP using Template 1 (Multi-purpose template)
 * This template also handles system notifications
 */
export const sendVerificationEmail = async (params: EmailVerificationParams): Promise<void> => {
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_hzt5pok', // Multi-purpose Template 1
      {
        // Basic email info
        to_email: params.to_email,
        to_name: params.to_name,
        subject: 'Email Verification - Clinic Appointment System',
        
        // Email content
        email_title: 'Email Verification',
        main_message: 'Please verify your email address by entering the verification code below:',
        
        // Show/hide sections for verification email
        show_verification: 'block',
        show_notification: 'none',
        show_action_button: 'inline-block',
        
        // Verification data
        otp_code: params.otp_code,
        
        // Action button
        action_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify-email`,
        action_button_text: 'Verify Email',
        
        // Instructions
        instruction_1: 'Enter the verification code in the verification page',
        instruction_2: 'The code expires in 10 minutes',
        instruction_3: 'Contact support if you need help',
        
        // Security notice
        security_message: 'If you did not request this verification, please ignore this email or contact our support team.',
        
        // Notification variables (hidden but must be provided)
        notification_type_label: '',
        notification_title: '',
        notification_message: '',
        notification_date: '',
        
        // Footer links
        portal_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/user-dashboard`,
        contact_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/contact`,
        privacy_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/privacy-policy`,
        unsubscribe_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/notifications/unsubscribe`,
      }
    );
    
    console.log('Verification email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email using Template 2 (Multi-purpose template)
 * This template also handles appointment notifications
 */
export const sendPasswordResetEmail = async (params: PasswordResetParams): Promise<void> => {
  try {
    // Validate recipient email
    if (!params.to_email || !params.to_email.trim()) {
      throw new Error('Recipient email is required');
    }

    const recipientEmail = params.to_email.trim().toLowerCase();
    
    // Log the recipient for debugging
    console.log(`[EmailJS] Sending password reset email TO: ${recipientEmail}`);
    console.log(`[EmailJS] Recipient name: ${params.to_name}`);
    console.log(`[EmailJS] Service ID: ${EMAILJS_CONFIG.serviceId}`);
    console.log(`[EmailJS] Template ID: template_01nl5co`);

    const emailParams = {
      // Basic email info - CRITICAL: This determines where the email goes
      to_email: recipientEmail, // *** This is the actual recipient ***
      to_name: params.to_name,
      subject: 'Password Reset - Clinic Appointment System',
      
      // Email content
      email_title: 'Password Reset',
      main_message: 'Your password has been reset. Here is your new temporary password:',
      
      // Show/hide sections for password reset
      show_password: 'block',
      show_appointment: 'none',
      show_secondary_action: 'none',
      show_appointment_notes: 'none',
      
      // Password data
      temp_password: params.temp_password,
      
      // Important message
      important_message: 'Please change this temporary password immediately after logging in for security purposes.',
      
      // Action buttons
      primary_action_link: params.reset_link || `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/login`,
      primary_action_text: 'Login Now',
      secondary_action_link: '',
      secondary_action_text: '',
      
      // Instructions
      instruction_1: 'Use the temporary password above to login',
      instruction_2: 'Change your password immediately after login',
      instruction_3: 'Contact support if you experience any issues',
      
      // Contact info
      clinic_phone: '+1 (555) 123-4567',
      
      // Appointment variables (hidden but must be provided)
      notification_type_label: '',
      appointment_date: '',
      appointment_time: '',
      doctor_name: '',
      department: '',
      appointment_id: '',
      additional_notes: '',
      
      // Footer links
      portal_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/user-dashboard`,
      manage_appointment_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/appointments/history`,
      contact_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/contact`,
      directions_link: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/directions`,
    };

    // Log the email parameters for debugging
    console.log('[EmailJS] Email parameters:', {
      to_email: emailParams.to_email,
      to_name: emailParams.to_name,
      subject: emailParams.subject,
      template: 'template_01nl5co'
    });

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_01nl5co', // Multi-purpose Template 2
      emailParams
    );
    
    console.log('[EmailJS] Password reset email sent successfully:', {
      status: result.status,
      text: result.text,
      sentTo: recipientEmail
    });
  } catch (error) {
    console.error('[EmailJS] Failed to send password reset email:', {
      error: error,
      recipientEmail: params.to_email,
      recipientName: params.to_name
    });
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send system notification email using Template 1 (Multi-purpose template)
 * Same template as email verification but different sections shown
 */
export const sendSystemNotificationEmail = async (params: SystemNotificationParams): Promise<void> => {
  try {
    const typeLabels = {
      system: 'System Notification',
      reminder: 'Reminder', 
      message: 'Message',
      appointment: 'Appointment Update'
    };

    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_hzt5pok', // Multi-purpose Template 1 (same as verification)
      {
        // Basic email info
        to_email: params.to_email,
        to_name: params.to_name,
        subject: `${typeLabels[params.notification_type]} - Clinic Appointment System`,
        
        // Email content
        email_title: typeLabels[params.notification_type],
        main_message: 'You have received a new notification from the clinic:',
        
        // Show/hide sections for system notification
        show_verification: 'none',
        show_notification: 'block',
        show_action_button: 'inline-block',
        
        // Notification data
        notification_type_label: typeLabels[params.notification_type],
        notification_title: params.notification_title,
        notification_message: params.notification_message,
        notification_date: params.notification_date || new Date().toLocaleDateString(),
        
        // Action button
        action_link: `${currentDomain}/user-dashboard`,
        action_button_text: 'View Dashboard',
        
        // Instructions
        instruction_1: 'Login to your patient portal for more details',
        instruction_2: 'Check your notification center regularly',
        instruction_3: 'Contact us if you have any questions',
        
        // Security notice
        security_message: 'This notification was sent to your registered email address. If you believe this was sent in error, please contact our support team.',
        
        // Verification variables (hidden but must be provided)
        otp_code: '',
        
        // Footer links
        portal_link: `${currentDomain}/user-dashboard`,
        contact_link: `${currentDomain}/contact`,
        privacy_link: `${currentDomain}/privacy-policy`,
        unsubscribe_link: `${currentDomain}/notifications/unsubscribe`,
      }
    );
    
    console.log('System notification email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send system notification email:', error);
    throw new Error('Failed to send system notification email');
  }
};

/**
 * Send appointment notification email using Template 2 (Multi-purpose template)
 * Same template as password reset but different sections shown
 */
export const sendAppointmentNotificationEmail = async (params: AppointmentNotificationParams): Promise<void> => {
  try {
    const typeLabels = {
      booking_confirmation: 'Appointment Confirmed',
      reminder: 'Appointment Reminder',
      cancellation: 'Appointment Cancelled',
      reschedule: 'Appointment Rescheduled'
    };

    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_01nl5co', // Multi-purpose Template 2 (same as password reset)
      {
        // Basic email info
        to_email: params.to_email,
        to_name: params.to_name,
        subject: `${typeLabels[params.notification_type]} - Clinic Appointment System`,
        
        // Email content
        email_title: typeLabels[params.notification_type],
        main_message: `Here are the details of your ${params.notification_type === 'booking_confirmation' ? 'confirmed' : params.notification_type === 'reminder' ? 'upcoming' : params.notification_type === 'cancellation' ? 'cancelled' : 'rescheduled'} appointment:`,
        
        // Show/hide sections for appointment notification
        show_password: 'none',
        show_appointment: 'block',
        show_secondary_action: params.notification_type === 'booking_confirmation' || params.notification_type === 'reminder' ? 'inline-block' : 'none',
        show_appointment_notes: params.additional_notes ? 'block' : 'none',
        
        // Appointment data
        notification_type_label: typeLabels[params.notification_type],
        appointment_date: params.appointment_date,
        appointment_time: params.appointment_time,
        doctor_name: params.doctor_name,
        department: params.department,
        appointment_id: params.appointment_id || '',
        additional_notes: params.additional_notes || '',
        
        // Important message based on type
        important_message: params.notification_type === 'booking_confirmation' 
          ? 'Please arrive 15 minutes early for your appointment and bring a valid ID.'
          : params.notification_type === 'reminder'
          ? 'Your appointment is scheduled for tomorrow. Please confirm or reschedule if needed.'
          : params.notification_type === 'cancellation'
          ? 'Your appointment has been cancelled. You can book a new appointment anytime.'
          : 'Your appointment has been rescheduled. Please note the new date and time above.',
        
        // Action buttons
        primary_action_link: `${currentDomain}/appointments/history`,
        primary_action_text: params.notification_type === 'booking_confirmation' ? 'View Appointment' : params.notification_type === 'reminder' ? 'Confirm Appointment' : params.notification_type === 'cancellation' ? 'Book New Appointment' : 'View Updated Appointment',
        secondary_action_link: `${currentDomain}/appointments/reschedule/${params.appointment_id}`,
        secondary_action_text: 'Reschedule',
        
        // Instructions based on type
        instruction_1: params.notification_type === 'booking_confirmation' 
          ? 'Save this confirmation for your records'
          : params.notification_type === 'reminder'
          ? 'Please confirm your attendance'
          : params.notification_type === 'cancellation'
          ? 'You can book a new appointment online'
          : 'Check the updated appointment details',
        instruction_2: params.notification_type === 'cancellation' 
          ? 'Contact us if you need assistance rebooking'
          : 'Contact us if you need to make changes',
        instruction_3: 'Arrive 15 minutes early on your appointment day',
        
        // Contact info
        clinic_phone: '+1 (555) 123-4567',
        
        // Password variables (hidden but must be provided)
        temp_password: '',
        
        // Footer links
        portal_link: `${currentDomain}/user-dashboard`,
        manage_appointment_link: `${currentDomain}/appointments/history`,
        contact_link: `${currentDomain}/contact`,
        directions_link: `${currentDomain}/directions`,
      }
    );
    
    console.log('Appointment notification email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send appointment notification email:', error);
    throw new Error('Failed to send appointment notification email');
  }
};

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a temporary password
 */
export const generateTempPassword = (): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill remaining characters
  for (let i = password.length; i < 12; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Check if EmailJS is properly configured
 */
export const isEmailJSConfigured = (): boolean => {
  return !!(
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.publicKey
  );
};

/**
 * Send email with custom template (generic function)
 */
export const sendCustomEmail = async (
  to_email: string,
  to_name: string,
  subject: string,
  templateId: string,
  templateParams: Record<string, any>
): Promise<void> => {
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      {
        to_email,
        to_name,
        subject,
        ...templateParams,
      }
    );
    
    console.log('Custom email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send custom email:', error);
    throw new Error('Failed to send custom email');
  }
};

/**
 * Validate EmailJS configuration and log debugging information
 */
export const validateEmailJSConfig = (): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!EMAILJS_CONFIG.serviceId) {
    issues.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID is not configured');
  }
  
  if (!EMAILJS_CONFIG.publicKey) {
    issues.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY is not configured');
  }
  
  // Log current configuration (without sensitive data)
  console.log('[EmailJS] Configuration status:', {
    serviceId: EMAILJS_CONFIG.serviceId ? 'CONFIGURED' : 'MISSING',
    publicKey: EMAILJS_CONFIG.publicKey ? 'CONFIGURED' : 'MISSING',
    serviceIdPrefix: EMAILJS_CONFIG.serviceId ? EMAILJS_CONFIG.serviceId.substring(0, 8) + '...' : 'N/A'
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Test email sending to a specific recipient (for debugging)
 */
export const testEmailDelivery = async (testEmail: string, testName: string = 'Test User'): Promise<void> => {
  try {
    console.log(`[EmailJS] Testing email delivery to: ${testEmail}`);
    
    const validation = validateEmailJSConfig();
    if (!validation.isValid) {
      throw new Error(`EmailJS configuration issues: ${validation.issues.join(', ')}`);
    }
    
    // Send a simple test email
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_01nl5co', // Using password reset template for testing
      {
        to_email: testEmail.trim().toLowerCase(),
        to_name: testName,
        subject: 'Email Delivery Test - Clinic Appointment System',
        email_title: 'Email Delivery Test',
        main_message: 'This is a test email to verify that emails are being sent to the correct recipient.',
        show_password: 'block',
        show_appointment: 'none',
        show_secondary_action: 'none',
        show_appointment_notes: 'none',
        temp_password: 'TEST123!',
        important_message: 'This is a test email. No action is required.',
        primary_action_link: 'http://localhost:3000',
        primary_action_text: 'Visit Website',
        secondary_action_link: '',
        secondary_action_text: '',
        instruction_1: 'This email was sent to test delivery',
        instruction_2: 'If you received this, delivery is working correctly',
        instruction_3: 'Check that this email was sent to the correct address',
        clinic_phone: '+1 (555) 123-4567',
        notification_type_label: '',
        appointment_date: '',
        appointment_time: '',
        doctor_name: '',
        department: '',
        appointment_id: '',
        additional_notes: '',
        portal_link: 'http://localhost:3000/user-dashboard',
        manage_appointment_link: 'http://localhost:3000/appointments/history',
        contact_link: 'http://localhost:3000/contact',
        directions_link: 'http://localhost:3000/directions',
      }
    );
    
    console.log('[EmailJS] Test email sent successfully:', {
      status: result.status,
      text: result.text,
      sentTo: testEmail.trim().toLowerCase()
    });
    
  } catch (error) {
    console.error('[EmailJS] Test email failed:', {
      error: error,
      testEmail: testEmail,
      testName: testName
    });
    throw error;
  }
}; 