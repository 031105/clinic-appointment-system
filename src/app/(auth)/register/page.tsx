'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { toast } from '@/components/ui/use-toast';
import { sendVerificationEmail, generateOTP, isEmailJSConfigured } from '@/utils/emailjs';

type RegistrationStep = 'form' | 'verification' | 'complete';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState(''); // For development

  // Step 1: Initial form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const finalLastName = lastName || firstName;

      if (!firstName || firstName.length < 2) {
        toast({
          title: "Error",
          description: "Please enter at least your first name (minimum 2 characters)",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call backend to initiate registration (generates OTP)
      const response = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName,
          lastName: finalLastName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to initiate registration');
      }

      // Send OTP via EmailJS if configured
      if (isEmailJSConfigured()) {
        try {
          await sendVerificationEmail({
            to_email: formData.email,
            to_name: formData.fullName,
            otp_code: data.otp || generateOTP(), // Use backend OTP or generate new one
            app_name: 'Clinic Appointment System'
          });
        } catch (emailError) {
          console.error('EmailJS failed:', emailError);
          toast({
            title: "Error",
            description: "Failed to send verification email. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Store OTP for development/fallback
      if (data.otp) {
        setGeneratedOTP(data.otp);
      }

      // Move to verification step
      setCurrentStep('verification');
      
    } catch (err) {
      console.error('Registration initiation error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to send verification code',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP verification and complete registration
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setOtpError(true);
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOtpError(false);

    try {
      // Split full name for backend
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const finalLastName = lastName || firstName;

      // Complete registration with OTP verification
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
          password: formData.password,
          firstName,
          lastName: finalLastName,
          role: 'patient', // Default role for self-registration
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to verify code and complete registration');
      }

      // Registration successful
      setCurrentStep('complete');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
      router.push('/login?registered=true');
      }, 3000);

    } catch (err) {
      console.error('OTP verification error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to verify code',
        variant: "destructive",
      });
      setOtpError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'registration',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      // Send new OTP via EmailJS if configured
      if (isEmailJSConfigured() && data.otp) {
        await sendVerificationEmail({
          to_email: formData.email,
          to_name: formData.fullName,
          otp_code: data.otp,
          app_name: 'Clinic Appointment System'
        });
      }

      // Update OTP for development
      if (data.otp) {
        setGeneratedOTP(data.otp);
      }

      // Start cooldown
      setResendCooldown(60);
      const countdown = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "Success",
        description: "New verification code sent to your email",
      });

    } catch (err) {
      console.error('Resend OTP error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to resend verification code',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Registration Form
  if (currentStep === 'form') {
  return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-600">Join us and start your journey to better health</p>
        </div>

        <form onSubmit={handleFormSubmit} className="px-8 pb-8 space-y-5">
          <div className="space-y-1">
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Sending verification code...' : 'Send Verification Code'}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (currentStep === 'verification') {
    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900">{formData.email}</p>
        </div>

        <form onSubmit={handleOTPSubmit} className="px-8 pb-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Enter Verification Code
            </label>
            
            <OTPInput
              value={otp}
              onChange={setOtp}
              error={otpError}
              disabled={isLoading}
              className="justify-center"
            />

            {/* Development mode: show generated OTP */}
            {process.env.NODE_ENV === 'development' && generatedOTP && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Development mode - OTP: {generatedOTP}</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 rounded-xl"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : 'Resend verification code'
              }
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentStep('form')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Back to registration form
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Registration Complete
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="px-8 pt-8 pb-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
          <p className="text-gray-600">
            Your account has been created successfully.
          </p>
          <p className="text-gray-600">
            Redirecting you to login page...
          </p>
        </div>
        
        <Link href="/login" className="block">
          <Button className="w-full py-3 rounded-xl">
            Go to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}