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

/**
 * Send email verification OTP using EmailJS template
 */
export const sendVerificationEmail = async (params: EmailVerificationParams): Promise<void> => {
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_hzt5pok', // Email verification template ID (user's actual template)
      {
        to_email: params.to_email,
        to_name: params.to_name,
        otp_code: params.otp_code,
        subject: 'Email Verification - Clinic Appointment System',
      }
    );
    
    console.log('Verification email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email with temporary password using EmailJS template
 */
export const sendPasswordResetEmail = async (params: PasswordResetParams): Promise<void> => {
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_01nl5co', // Password reset template ID (user's actual template)
      {
        to_email: params.to_email,
        to_name: params.to_name,
        temp_password: params.temp_password,
        reset_link: params.reset_link || `${window.location.origin}/login`,
        subject: 'Password Reset - Clinic Appointment System',
      }
    );
    
    console.log('Password reset email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
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