'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/use-toast';
import { sendPasswordResetEmail, isEmailJSConfigured } from '@/utils/emailjs';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Validate email on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError && value !== email) {
      setEmailError('');
    }
  };

  // Validate email format
  const validateEmailInput = () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return false;
    }

    const validation = validateEmail(trimmedEmail);
    if (!validation.isValid) {
      setEmailError(validation.error || 'Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmailInput()) {
      return;
    }

    setIsLoading(true);
    const trimmedEmail = email.trim();

    try {
      console.log(`[Forgot Password] Attempting password reset for: ${trimmedEmail}`);

      // Call backend to generate temporary password
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();
      console.log(`[Forgot Password] Backend response:`, { 
        status: response.status, 
        success: data.success,
        hasUserData: !!(data.tempPassword && data.userName)
      });

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid email format');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Failed to process password reset request');
        }
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to process password reset request');
      }

      // Check if we need to send email (only if EmailJS is configured and we have user data)
      let emailSent = false;
      if (isEmailJSConfigured() && data.tempPassword && data.userName) {
        try {
          console.log(`[Forgot Password] Sending email via EmailJS to: ${trimmedEmail}`);
          await sendPasswordResetEmail({
            to_email: trimmedEmail,
            to_name: data.userName,
            temp_password: data.tempPassword,
            reset_link: `${window.location.origin}/login`,
          });
          emailSent = true;
          console.log(`[Forgot Password] Email sent successfully`);
        } catch (emailError) {
          console.error('[Forgot Password] EmailJS failed:', emailError);
          toast({
            title: "Warning",
            description: "Password was reset but email could not be sent. Please contact support for your temporary password.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else if (!isEmailJSConfigured()) {
        console.warn('[Forgot Password] EmailJS not configured - password reset processed but no email sent');
      } else if (!data.tempPassword || !data.userName) {
        console.log('[Forgot Password] No user data returned - email may not exist in system');
      }

      // Always show success message (security best practice - don't reveal if email exists)
      setIsSubmitted(true);
      
      // Log success for debugging
      console.log(`[Forgot Password] Process completed successfully. Email configured: ${isEmailJSConfigured()}, Email sent: ${emailSent}`);
      
    } catch (err) {
      console.error('[Forgot Password] Error:', err);
      
      // Show specific error message
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to process password reset request',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="px-8 pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600">
          {isSubmitted 
            ? 'Password reset instructions have been sent to your email' 
            : 'Enter your email address and we\'ll send you a temporary password to reset your account'}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={validateEmailInput}
              className={`block w-full px-4 py-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                emailError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              required
              autoComplete="email"
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-sm text-red-600 mt-1">{emailError}</p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 rounded-xl"
            disabled={isLoading || !isEmailJSConfigured() || !!emailError}
          >
            {isLoading ? 'Processing...' : 'Send Temporary Password'}
          </Button>

          {/* EmailJS Configuration Warning */}
          {!isEmailJSConfigured() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Email Service Not Configured
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>EmailJS service is not configured. Password reset functionality is currently unavailable.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to login
            </Link>
          </div>
        </form>
      ) : (
        <div className="px-8 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <p className="text-center text-gray-600">
            If an account exists with the email <span className="font-medium">{email.trim()}</span>, 
            we've sent a temporary password to your email.
          </p>
          
          <p className="text-center text-gray-600 text-sm">
            Please check your email inbox and spam folder. Use the temporary password to login, 
            then you'll be prompted to set a new password.
          </p>
          
          <div className="pt-4">
            <Link href="/login" className="block w-full">
              <Button className="w-full py-3 rounded-xl">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}