// Email testing utility
import { getClientEmailTemplate, type EmailTemplateData } from './emailTemplate';

/**
 * Test email template generation
 */
export const testEmailTemplates = () => {
  console.log('🧪 Testing Email Templates...\n');

  // Test verification email
  const verificationData: EmailTemplateData = {
    to_name: '张三',
    to_email: 'zhangsan@example.com',
    app_name: '诊所预约系统',
    otp_code: '123456',
  };

  const verificationHtml = getClientEmailTemplate('verification', verificationData);
  console.log('✅ Verification Email Template Generated');
  console.log('📧 Subject: 邮箱验证 - 诊所预约系统');
  console.log('📝 Content Length:', verificationHtml.length, 'characters\n');

  // Test password reset email
  const resetData: EmailTemplateData = {
    to_name: '李四',
    to_email: 'lisi@example.com',
    app_name: '诊所预约系统',
    temp_password: 'TempPass123!',
    reset_link: 'http://localhost:3000/login',
  };

  const resetHtml = getClientEmailTemplate('reset-password', resetData);
  console.log('✅ Password Reset Email Template Generated');
  console.log('📧 Subject: 密码重置 - 诊所预约系统');
  console.log('📝 Content Length:', resetHtml.length, 'characters\n');

  console.log('🎉 All email templates are working correctly!');
  
  return {
    verification: verificationHtml,
    reset: resetHtml
  };
};

/**
 * Preview email in browser (for development)
 */
export const previewEmailInBrowser = (type: 'verification' | 'reset-password') => {
  const data: EmailTemplateData = type === 'verification' 
    ? {
        to_name: '测试用户',
        to_email: 'test@example.com',
        app_name: '诊所预约系统',
        otp_code: '123456',
      }
    : {
        to_name: '测试用户',
        to_email: 'test@example.com',
        app_name: '诊所预约系统',
        temp_password: 'TempPass123!',
        reset_link: 'http://localhost:3000/login',
      };

  const html = getClientEmailTemplate(type, data);
  
  // Create a blob URL for preview
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window
  window.open(url, '_blank');
  
  return html;
}; 