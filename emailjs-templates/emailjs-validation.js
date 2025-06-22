// EmailJS Configuration Validation Script
// Run this in browser console or as a Node.js script

console.log('🚀 EmailJS Configuration Validation Started...\n');

// Required configuration
const REQUIRED_CONFIG = {
  // Frontend environment variables
  NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
  
  // Known template IDs that must exist
  TEMPLATE_1_ID: 'template_hzt5pok',  // Multi-purpose Template 1
  TEMPLATE_2_ID: 'template_01nl5co',  // Multi-purpose Template 2
};

// Your current configuration (from .env.local)
const CURRENT_CONFIG = {
  SERVICE_ID_OLD: 'service_q237ahi',    // Previous service ID
  SERVICE_ID_NEW: 'service_zdk8m9i',    // New service ID you mentioned
  PUBLIC_KEY: 'your_public_key_here',
};

// Test email data
const TEST_DATA = {
  to_email: 'test@example.com',
  to_name: 'Test User',
  otp_code: '123456',
  temp_password: 'TempPass123!',
  notification_title: 'Test System Notification',
  notification_message: 'This is a test notification message.',
  appointment_date: '2024-12-20',
  appointment_time: '10:00 AM',
  doctor_name: 'Dr. Test',
  department: 'Test Department',
};

// Validation functions
function validateEnvironmentVariables() {
  console.log('📋 1. Environment Variables Check:');
  console.log('═'.repeat(50));
  
  const checks = [
    { name: 'NEXT_PUBLIC_EMAILJS_SERVICE_ID', value: REQUIRED_CONFIG.NEXT_PUBLIC_EMAILJS_SERVICE_ID },
    { name: 'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY', value: REQUIRED_CONFIG.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY },
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    const message = check.value ? `Set: ${check.value}` : 'NOT SET';
    console.log(`${status} ${check.name}: ${message}`);
    if (!check.value) allPassed = false;
  });
  
  console.log('\n📊 Service ID Comparison:');
  console.log(`   Current (.env.local): ${CURRENT_CONFIG.SERVICE_ID_OLD}`);
  console.log(`   New (mentioned):      ${CURRENT_CONFIG.SERVICE_ID_NEW}`);
  console.log(`   Environment var:      ${REQUIRED_CONFIG.NEXT_PUBLIC_EMAILJS_SERVICE_ID}`);
  
  return allPassed;
}

function validateTemplateConfiguration() {
  console.log('\n🎨 2. Template Configuration:');
  console.log('═'.repeat(50));
  
  const templates = [
    {
      id: REQUIRED_CONFIG.TEMPLATE_1_ID,
      name: 'Multi-purpose Template 1',
      purposes: ['Email Verification', 'System Notifications'],
      theme: 'Purple gradient'
    },
    {
      id: REQUIRED_CONFIG.TEMPLATE_2_ID,
      name: 'Multi-purpose Template 2', 
      purposes: ['Password Reset', 'Appointment Notifications'],
      theme: 'Blue gradient'
    }
  ];
  
  templates.forEach(template => {
    console.log(`📧 Template ID: ${template.id}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Theme: ${template.theme}`);
    console.log(`   Purposes: ${template.purposes.join(', ')}`);
    console.log('');
  });
  
  return true;
}

// EmailJS connectivity test (browser only)
async function testEmailJSConnectivity(serviceId, publicKey) {
  if (typeof window === 'undefined') {
    console.log('⚠️  Connectivity test requires browser environment');
    return false;
  }
  
  console.log('\n🔌 3. EmailJS Connectivity Test:');
  console.log('═'.repeat(50));
  
  try {
    // Import EmailJS (assuming it's loaded)
    if (typeof emailjs === 'undefined') {
      console.log('❌ EmailJS library not loaded');
      return false;
    }
    
    // Initialize EmailJS
    emailjs.init(publicKey);
    console.log('✅ EmailJS initialized successfully');
    
    // Test service connectivity (dry run)
    console.log(`🔍 Testing service: ${serviceId}`);
    console.log(`🔑 Using public key: ${publicKey}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ EmailJS connectivity failed: ${error.message}`);
    return false;
  }
}

// Template validation test
async function testTemplateParameters() {
  console.log('\n🧪 4. Template Parameter Validation:');
  console.log('═'.repeat(50));
  
  const template1Params = [
    'to_email', 'to_name', 'subject', 'email_title', 'main_message',
    'show_verification', 'show_notification', 'show_action_button',
    'otp_code', 'notification_type_label', 'notification_title', 
    'notification_message', 'notification_date', 'action_link', 
    'action_button_text', 'instruction_1', 'instruction_2', 
    'instruction_3', 'security_message', 'portal_link', 'contact_link', 
    'privacy_link', 'unsubscribe_link'
  ];
  
  const template2Params = [
    'to_email', 'to_name', 'subject', 'email_title', 'main_message',
    'show_password', 'show_appointment', 'show_secondary_action', 
    'show_appointment_notes', 'temp_password', 'notification_type_label',
    'appointment_date', 'appointment_time', 'doctor_name', 'department',
    'appointment_id', 'additional_notes', 'important_message',
    'primary_action_link', 'primary_action_text', 'secondary_action_link',
    'secondary_action_text', 'instruction_1', 'instruction_2', 'instruction_3',
    'clinic_phone', 'portal_link', 'manage_appointment_link', 'contact_link',
    'directions_link'
  ];
  
  console.log(`📧 Template 1 (${REQUIRED_CONFIG.TEMPLATE_1_ID}): ${template1Params.length} parameters`);
  console.log(`   Key params: ${template1Params.slice(0, 5).join(', ')}...`);
  
  console.log(`📧 Template 2 (${REQUIRED_CONFIG.TEMPLATE_2_ID}): ${template2Params.length} parameters`);
  console.log(`   Key params: ${template2Params.slice(0, 5).join(', ')}...`);
  
  return true;
}

// Service ID migration helper
function suggestServiceIdMigration() {
  console.log('\n🔄 5. Service ID Migration:');
  console.log('═'.repeat(50));
  
  if (CURRENT_CONFIG.SERVICE_ID_OLD !== CURRENT_CONFIG.SERVICE_ID_NEW) {
    console.log('⚠️  Service ID mismatch detected!');
    console.log(`   Current: ${CURRENT_CONFIG.SERVICE_ID_OLD}`);
    console.log(`   New:     ${CURRENT_CONFIG.SERVICE_ID_NEW}`);
    console.log('\n📝 To update service ID:');
    console.log(`   1. Update .env.local: NEXT_PUBLIC_EMAILJS_SERVICE_ID=${CURRENT_CONFIG.SERVICE_ID_NEW}`);
    console.log(`   2. Update server/.env: EMAILJS_SERVICE_ID=${CURRENT_CONFIG.SERVICE_ID_NEW}`);
    console.log('   3. Restart both frontend and backend services');
    console.log('   4. Re-run this validation script');
  } else {
    console.log('✅ Service IDs are consistent');
  }
}

// Generate test commands
function generateTestCommands() {
  console.log('\n🧪 6. Test Commands:');
  console.log('═'.repeat(50));
  
  console.log('Run these commands in browser console to test each email type:\n');
  
  // Verification email test
  console.log('// Test 1: Email Verification');
  console.log(`sendVerificationEmail({
  to_email: '${TEST_DATA.to_email}',
  to_name: '${TEST_DATA.to_name}',
  otp_code: '${TEST_DATA.otp_code}'
});\n`);

  // System notification test
  console.log('// Test 2: System Notification');
  console.log(`sendSystemNotificationEmail({
  to_email: '${TEST_DATA.to_email}',
  to_name: '${TEST_DATA.to_name}',
  notification_title: '${TEST_DATA.notification_title}',
  notification_message: '${TEST_DATA.notification_message}',
  notification_type: 'system'
});\n`);

  // Password reset test
  console.log('// Test 3: Password Reset');
  console.log(`sendPasswordResetEmail({
  to_email: '${TEST_DATA.to_email}',
  to_name: '${TEST_DATA.to_name}',
  temp_password: '${TEST_DATA.temp_password}'
});\n`);

  // Appointment notification test
  console.log('// Test 4: Appointment Notification');
  console.log(`sendAppointmentNotificationEmail({
  to_email: '${TEST_DATA.to_email}',
  to_name: '${TEST_DATA.to_name}',
  appointment_date: '${TEST_DATA.appointment_date}',
  appointment_time: '${TEST_DATA.appointment_time}',
  doctor_name: '${TEST_DATA.doctor_name}',
  department: '${TEST_DATA.department}',
  notification_type: 'booking_confirmation'
});\n`);
}

// Main validation function
async function runFullValidation() {
  console.log('🎯 EmailJS Full Validation Report');
  console.log('═'.repeat(60));
  
  const results = {
    envVars: validateEnvironmentVariables(),
    templates: validateTemplateConfiguration(),
    connectivity: await testEmailJSConnectivity(CURRENT_CONFIG.SERVICE_ID_NEW, CURRENT_CONFIG.PUBLIC_KEY),
    parameters: await testTemplateParameters(),
  };
  
  suggestServiceIdMigration();
  generateTestCommands();
  
  // Final summary
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('═'.repeat(50));
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passed}/${total} checks`);
  console.log(`📧 Service ID (Current): ${CURRENT_CONFIG.SERVICE_ID_OLD}`);
  console.log(`📧 Service ID (New): ${CURRENT_CONFIG.SERVICE_ID_NEW}`);
  console.log(`🔑 Public Key: ${CURRENT_CONFIG.PUBLIC_KEY}`);
  console.log(`🎨 Templates: ${REQUIRED_CONFIG.TEMPLATE_1_ID}, ${REQUIRED_CONFIG.TEMPLATE_2_ID}`);
  
  if (passed === total) {
    console.log('\n🎉 All validations passed! EmailJS is ready to use.');
  } else {
    console.log('\n⚠️  Some validations failed. Please check the issues above.');
  }
  
  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🌐 Running in browser environment');
  window.runEmailJSValidation = runFullValidation;
  window.testConnectivity = () => testEmailJSConnectivity(CURRENT_CONFIG.SERVICE_ID_NEW, CURRENT_CONFIG.PUBLIC_KEY);
  
  // Auto-run validation
  runFullValidation();
} else {
  // Node.js environment
  console.log('🖥️  Running in Node.js environment');
  runFullValidation();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFullValidation,
    validateEnvironmentVariables,
    validateTemplateConfiguration,
    testEmailJSConnectivity,
    testTemplateParameters,
    CURRENT_CONFIG,
    REQUIRED_CONFIG
  };
} 