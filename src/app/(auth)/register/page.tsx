'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { toast } from '@/components/ui/use-toast';
import { sendVerificationEmail, generateOTP, isEmailJSConfigured } from '@/utils/emailjs';

type RegistrationStep = 'form' | 'verification' | 'patient-info' | 'complete';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PatientInfo {
  dateOfBirth: string;
  bloodGroup: string;
  height: string;
  weight: string;
}

export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Patient info state
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    dateOfBirth: '',
    bloodGroup: '',
    height: '',
    weight: ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState(''); // For development

  // Blood group options
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Validation functions
  const validateForm = () => {
    // Trim all fields
    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword
    };

    // First name validation
    if (!trimmedData.firstName || trimmedData.firstName.length < 2) {
      toast({
        title: "Error",
        description: "First name must be at least 2 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(trimmedData.firstName)) {
      toast({
        title: "Error", 
        description: "First name can only contain letters, spaces, hyphens, and apostrophes",
        variant: "destructive",
      });
      return false;
    }

    // Last name validation
    if (!trimmedData.lastName || trimmedData.lastName.length < 2) {
      toast({
        title: "Error",
        description: "Last name must be at least 2 characters long",
        variant: "destructive",
      });
      return false;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(trimmedData.lastName)) {
      toast({
        title: "Error",
        description: "Last name can only contain letters, spaces, hyphens, and apostrophes",
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Password validation
    if (trimmedData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    // Password complexity validation (must match backend requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(trimmedData.password)) {
      toast({
        title: "Error",
        description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        variant: "destructive",
      });
      return false;
    }

    // Confirm password validation
    if (trimmedData.password !== trimmedData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validatePatientInfo = () => {
    // Date of birth validation (required)
    if (!patientInfo.dateOfBirth) {
      toast({
        title: "Error",
        description: "Date of birth is required",
        variant: "destructive",
      });
      return false;
    }

    // Check if date of birth is not in the future
    const birthDate = new Date(patientInfo.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      toast({
        title: "Error",
        description: "Date of birth cannot be in the future",
        variant: "destructive",
      });
      return false;
    }

    // Check minimum age (must be at least 1 year old)
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 1) {
      toast({
        title: "Error",
        description: "Patient must be at least 1 year old",
        variant: "destructive",
      });
      return false;
    }

    // Height validation (optional, but if provided must be valid)
    if (patientInfo.height && (parseFloat(patientInfo.height) < 30 || parseFloat(patientInfo.height) > 300)) {
      toast({
        title: "Error",
        description: "Height must be between 30 and 300 cm",
        variant: "destructive",
      });
      return false;
    }

    // Weight validation (optional, but if provided must be valid)
    if (patientInfo.weight && (parseFloat(patientInfo.weight) < 0.5 || parseFloat(patientInfo.weight) > 1000)) {
      toast({
        title: "Error",
        description: "Weight must be between 0.5 and 1000 kg",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Step 1: Initial form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Trim names for backend
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim();

      // Call backend to initiate registration (generates OTP)
      const response = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
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
            to_email: email,
            to_name: `${firstName} ${lastName}`,
            otp_code: data.otp || generateOTP(), // Use backend OTP or generate new one
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

  // Step 2: OTP verification
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
      // Verify OTP with backend
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otp,
          type: 'registration',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code');
      }

      // OTP verified successfully, move to patient info collection
      setCurrentStep('patient-info');
      
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

  // Step 3: Patient info submission and complete registration
  const handlePatientInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePatientInfo()) {
      return;
    }

    setIsLoading(true);

    try {
      // Trim names for backend
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim();

      // Complete registration with OTP verification and patient info
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otp,
          password: formData.password,
          firstName,
          lastName,
          role: 'patient',
          patientInfo: {
            dateOfBirth: patientInfo.dateOfBirth,
            bloodGroup: patientInfo.bloodGroup || null,
            height: patientInfo.height ? parseFloat(patientInfo.height) : null,
            weight: patientInfo.weight ? parseFloat(patientInfo.weight) : null,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete registration');
      }

      // Registration successful
      setCurrentStep('complete');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 3000);

    } catch (err) {
      console.error('Registration completion error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to complete registration',
        variant: "destructive",
      });
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
          email: formData.email.trim(),
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
          to_email: formData.email.trim(),
          to_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          otp_code: data.otp,
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
          {/* First Name */}
          <div className="space-y-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your first name"
              required
              minLength={2}
              maxLength={50}
            />
            <p className="text-xs text-gray-500">Minimum 2 characters</p>
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your last name"
              required
              minLength={2}
              maxLength={50}
            />
            <p className="text-xs text-gray-500">Minimum 2 characters</p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a secure password"
              required
              minLength={8}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
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
            {isLoading ? 'Verifying...' : 'Verify Email'}
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

  // Step 3: Patient Information
  if (currentStep === 'patient-info') {
    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-sm text-gray-600">
            Please provide your basic medical information to complete registration
          </p>
        </div>

        <form onSubmit={handlePatientInfoSubmit} className="px-8 pb-8 space-y-5">
          {/* Date of Birth */}
          <div className="space-y-1">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={patientInfo.dateOfBirth}
              onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              max={new Date().toISOString().split('T')[0]} // Cannot be future date
            />
          </div>

          {/* Blood Group */}
          <div className="space-y-1">
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
              Blood Group (Optional)
            </label>
            <select
              id="bloodGroup"
              value={patientInfo.bloodGroup}
              onChange={(e) => setPatientInfo(prev => ({ ...prev, bloodGroup: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Height */}
          <div className="space-y-1">
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Height (cm) (Optional)
            </label>
            <input
              id="height"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={patientInfo.height}
              onChange={(e) => setPatientInfo(prev => ({ ...prev, height: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your height in cm"
            />
            <p className="text-xs text-gray-500">Between 30 and 300 cm</p>
          </div>

          {/* Weight */}
          <div className="space-y-1">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (kg) (Optional)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0.5"
              max="1000"
              value={patientInfo.weight}
              onChange={(e) => setPatientInfo(prev => ({ ...prev, weight: e.target.value }))}
              className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your weight in kg"
            />
            <p className="text-xs text-gray-500">Between 0.5 and 1000 kg</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Why do we need this information?</strong>
              <br />
              This basic medical information helps our healthcare providers give you better care and ensures accurate medical records from the start.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Complete Registration'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentStep('verification')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              ← Back to verification
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 4: Registration Complete
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="px-8 py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your account and medical profile have been created and verified. You will be redirected to the login page shortly.
        </p>
        <div className="space-y-3">
          <Link href="/login?registered=true">
            <Button className="w-full py-3 rounded-xl">
              Continue to Login
            </Button>
          </Link>
          <p className="text-xs text-gray-500">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}