'use client';

import { useState } from 'react';
import { sendVerificationEmail, sendPasswordResetEmail, isEmailJSConfigured } from '@/utils/emailjs';

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testName, setTestName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestVerificationEmail = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      await sendVerificationEmail({
        to_email: testEmail,
        to_name: testName,
        otp_code: '123456',
      });
      setResult('✅ Verification email sent successfully!');
    } catch (error) {
      setResult(`❌ Failed to send verification email: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPasswordResetEmail = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      await sendPasswordResetEmail({
        to_email: testEmail,
        to_name: testName,
        temp_password: 'TempPass123!',
        reset_link: `${window.location.origin}/login`,
      });
      setResult('✅ Password reset email sent successfully!');
    } catch (error) {
      setResult(`❌ Failed to send password reset email: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-4">📧 EmailJS Testing Page</h1>
          <p className="text-gray-600 mb-6">
            Test EmailJS email functionality with direct template integration.
          </p>

          {/* Test Settings */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test name"
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <button
              onClick={handleTestVerificationEmail}
              disabled={isLoading || !isEmailJSConfigured()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Sending...' : '📩 Test Verification Email'}
            </button>
            
            <button
              onClick={handleTestPasswordResetEmail}
              disabled={isLoading || !isEmailJSConfigured()}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Sending...' : '🔐 Test Password Reset Email'}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-md ${result.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result}
            </div>
          )}
        </div>

        {/* Configuration Status */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">⚙️ EmailJS Configuration Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>EmailJS Service ID:</span>
              <span className={process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Configured' : '❌ Not Configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>EmailJS Public Key:</span>
              <span className={process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✅ Configured' : '❌ Not Configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Overall Status:</span>
              <span className={isEmailJSConfigured() ? 'text-green-600' : 'text-red-600'}>
                {isEmailJSConfigured() ? '✅ Ready' : '❌ Configuration Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 EmailJS Template Configuration</h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p><strong>✅ Current Template IDs Configured:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Email Verification: <code>template_hzt5pok</code></li>
              <li>Password Reset: <code>template_01nl5co</code></li>
            </ul>
            
            <p className="mt-4"><strong>📧 Template Variables Used:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>{'{{to_email}}'}</code> - Recipient email address</li>
              <li><code>{'{{to_name}}'}</code> - Recipient name</li>
              <li><code>{'{{subject}}'}</code> - Email subject</li>
              <li><code>{'{{otp_code}}'}</code> - Verification code (verification emails)</li>
              <li><code>{'{{temp_password}}'}</code> - Temporary password (password reset)</li>
              <li><code>{'{{reset_link}}'}</code> - Login link (password reset)</li>
            </ul>
            
            <p className="mt-4"><strong>⚙️ Environment Variables:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>NEXT_PUBLIC_EMAILJS_SERVICE_ID</code> - Your EmailJS service ID</li>
              <li><code>NEXT_PUBLIC_EMAILJS_PUBLIC_KEY</code> - Your EmailJS public key</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 