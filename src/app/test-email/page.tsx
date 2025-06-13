'use client';

import { useState } from 'react';
import { sendVerificationEmail, sendPasswordResetEmail, sendSystemNotificationEmail, sendAppointmentNotificationEmail, isEmailJSConfigured, validateEmailJSConfig, testEmailDelivery } from '@/utils/emailjs';

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

  const handleTestSystemNotificationEmail = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      await sendSystemNotificationEmail({
        to_email: testEmail,
        to_name: testName,
        notification_title: 'System Maintenance Notice',
        notification_message: 'Our system will undergo scheduled maintenance from 2:00 AM to 4:00 AM tomorrow. During this time, some services may be temporarily unavailable. We apologize for any inconvenience.',
        notification_type: 'system',
        notification_date: new Date().toLocaleDateString()
      });
      setResult('✅ System notification email sent successfully!');
    } catch (error) {
      setResult(`❌ Failed to send system notification email: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAppointmentNotificationEmail = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      await sendAppointmentNotificationEmail({
        to_email: testEmail,
        to_name: testName,
        appointment_date: 'December 15, 2024',
        appointment_time: '10:30 AM',
        doctor_name: 'Dr. Sarah Johnson',
        department: 'Cardiology',
        notification_type: 'booking_confirmation',
        appointment_id: 'APT-2024-001',
        additional_notes: 'Please bring your insurance card and arrive 15 minutes early for check-in.'
      });
      setResult('✅ Appointment notification email sent successfully!');
    } catch (error) {
      setResult(`❌ Failed to send appointment notification email: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmailDelivery = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      await testEmailDelivery(testEmail, testName);
      setResult(`✅ Test email sent successfully to ${testEmail}! Check your inbox to verify it was delivered to the correct recipient.`);
    } catch (error) {
      setResult(`❌ Failed to send test email: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateConfig = () => {
    const validation = validateEmailJSConfig();
    if (validation.isValid) {
      setResult('✅ EmailJS configuration is valid and ready to use!');
    } else {
      setResult(`❌ EmailJS configuration issues: ${validation.issues.join(', ')}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">📧 Email Template Testing</h1>
          
          {/* Configuration Check */}
          <div className={`mb-6 p-4 rounded-md ${isEmailJSConfigured() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${isEmailJSConfigured() ? 'text-green-800' : 'text-red-800'}`}>
                {isEmailJSConfigured() ? '✅ EmailJS Configured' : '❌ EmailJS Not Configured'}
              </span>
            </div>
            {!isEmailJSConfigured() && (
              <p className="text-sm text-red-700 mt-1">
                Please configure NEXT_PUBLIC_EMAILJS_SERVICE_ID and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in your environment variables.
              </p>
            )}
          </div>

          {/* Test Email Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Test Email Address
              </label>
              <input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test email address"
              />
            </div>
            
            <div>
              <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-1">
                Test Name
              </label>
              <input
                id="testName"
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
              onClick={handleValidateConfig}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700"
            >
              🔍 Validate EmailJS Configuration
            </button>

            <button
              onClick={handleTestEmailDelivery}
              disabled={isLoading || !isEmailJSConfigured()}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Sending...' : '🎯 Test Email Delivery (Debug Recipients)'}
            </button>

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

            <button
              onClick={handleTestSystemNotificationEmail}
              disabled={isLoading || !isEmailJSConfigured()}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Sending...' : '🔔 Test System Notification Email'}
            </button>

            <button
              onClick={handleTestAppointmentNotificationEmail}
              disabled={isLoading || !isEmailJSConfigured()}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Sending...' : '📅 Test Appointment Notification Email'}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`p-4 rounded-md ${result.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result}
            </div>
          )}
        </div>

        {/* Configuration Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 EmailJS Template Configuration</h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p><strong>✅ Current Template IDs Required:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Email Verification: <code>template_hzt5pok</code></li>
              <li>Password Reset: <code>template_01nl5co</code></li>
              <li>System Notification: <code>template_sys_notif</code> (New)</li>
              <li>Appointment Notification: <code>template_appointment</code> (New)</li>
            </ul>
            
            <p className="mt-4"><strong>📧 System Notification Template Variables:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>{'{{to_email}}'}</code> - Recipient email address</li>
              <li><code>{'{{to_name}}'}</code> - Recipient name</li>
              <li><code>{'{{subject}}'}</code> - Email subject</li>
              <li><code>{'{{notification_title}}'}</code> - Notification title</li>
              <li><code>{'{{notification_message}}'}</code> - Notification message</li>
              <li><code>{'{{notification_type}}'}</code> - Type (system, reminder, message, appointment)</li>
              <li><code>{'{{notification_type_label}}'}</code> - Human readable type label</li>
              <li><code>{'{{notification_date}}'}</code> - Notification date</li>
              <li><code>{'{{portal_link}}'}</code> - Link to patient portal</li>
              <li><code>{'{{unsubscribe_link}}'}</code> - Unsubscribe link</li>
              <li><code>{'{{privacy_policy_link}}'}</code> - Privacy policy link</li>
            </ul>

            <p className="mt-4"><strong>📅 Appointment Notification Template Variables:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>{'{{to_email}}'}</code> - Recipient email address</li>
              <li><code>{'{{to_name}}'}</code> - Recipient name</li>
              <li><code>{'{{subject}}'}</code> - Email subject</li>
              <li><code>{'{{appointment_date}}'}</code> - Appointment date</li>
              <li><code>{'{{appointment_time}}'}</code> - Appointment time</li>
              <li><code>{'{{doctor_name}}'}</code> - Doctor's name</li>
              <li><code>{'{{department}}'}</code> - Department name</li>
              <li><code>{'{{notification_type}}'}</code> - Type (booking_confirmation, reminder, cancellation, reschedule)</li>
              <li><code>{'{{notification_type_label}}'}</code> - Human readable type label</li>
              <li><code>{'{{appointment_id}}'}</code> - Appointment ID</li>
              <li><code>{'{{additional_notes}}'}</code> - Additional notes</li>
              <li><code>{'{{portal_link}}'}</code> - Link to patient portal</li>
              <li><code>{'{{manage_appointment_link}}'}</code> - Link to manage appointments</li>
              <li><code>{'{{contact_us_link}}'}</code> - Contact us link</li>
              <li><code>{'{{directions_link}}'}</code> - Directions link</li>
              <li><code>{'{{clinic_phone}}'}</code> - Clinic phone number</li>
            </ul>
            
            <p className="mt-4"><strong>⚙️ Environment Variables:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>NEXT_PUBLIC_EMAILJS_SERVICE_ID</code> - Your EmailJS service ID</li>
              <li><code>NEXT_PUBLIC_EMAILJS_PUBLIC_KEY</code> - Your EmailJS public key</li>
            </ul>
          </div>
        </div>

        {/* Template Files */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-yellow-800">📁 HTML Template Files</h3>
          <div className="text-yellow-700 space-y-2 text-sm">
            <p>The following HTML template files have been created for you to copy into EmailJS:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><code>email-templates/system-notification-template.html</code> - For system notifications</li>
              <li><code>email-templates/appointment-notification-template.html</code> - For appointment notifications</li>
            </ul>
            <p className="mt-2">
              <strong>Instructions:</strong> Copy the HTML content from these files and paste them into your EmailJS templates 
              with the corresponding template IDs mentioned above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 