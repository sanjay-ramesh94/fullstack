// checkBookingRoute.js - Analyze your booking route
const fs = require('fs');
const path = require('path');

// Read the booking route file
const bookingRoutePath = path.join(__dirname, 'routes', 'booking.js');

try {
  const content = fs.readFileSync(bookingRoutePath, 'utf8');
  
  console.log('🔍 ANALYZING BOOKING ROUTE...\n');
  
  // Check if emailService is imported
  const emailServiceImport = content.includes('const emailService = require');
  console.log('✅ EmailService imported:', emailServiceImport);
  
  if (emailServiceImport) {
    const importLine = content.split('\n').find(line => 
      line.includes('const emailService = require')
    );
    console.log('   Import line:', importLine?.trim());
  }
  
  // Check for email method calls
  const emailMethods = [
    'sendBookingConfirmation',
    'sendBookingNotification',
    'sendStatusUpdateEmail',
    'sendCancellationNotification'
  ];
  
  console.log('\n📧 EMAIL METHOD CALLS:');
  emailMethods.forEach(method => {
    const found = content.includes(method);
    console.log(`   ${method}:`, found ? '✅ Found' : '❌ Not found');
    
    if (found) {
      const lines = content.split('\n');
      const methodLines = lines.filter(line => line.includes(method));
      methodLines.forEach((line, index) => {
        console.log(`      Line ${index + 1}: ${line.trim()}`);
      });
    }
  });
  
  // Check for try-catch blocks around email calls
  const emailCallsInTryCatch = content.includes('await emailService') && 
                               content.includes('try') && 
                               content.includes('catch');
  
  console.log('\n🛡️  ERROR HANDLING:');
  console.log('   Email calls in try-catch:', emailCallsInTryCatch ? '✅ Yes' : '❌ No');
  
  // Check for async/await usage
  const hasAsyncAwait = content.includes('async') && content.includes('await emailService');
  console.log('   Using async/await for emails:', hasAsyncAwait ? '✅ Yes' : '❌ No');
  
  // Look for potential issues
  console.log('\n🔍 POTENTIAL ISSUES:');
  
  // Check if emails are being awaited
  const emailCalls = content.match(/emailService\.\w+\(/g);
  if (emailCalls) {
    console.log('   Email method calls found:', emailCalls.length);
    
    const awaitedCalls = content.match(/await emailService\.\w+\(/g);
    const nonAwaitedCalls = emailCalls.length - (awaitedCalls?.length || 0);
    
    if (nonAwaitedCalls > 0) {
      console.log('   ⚠️  Non-awaited email calls:', nonAwaitedCalls);
      console.log('      (These might be running but not waiting for completion)');
    }
  }
  
  // Check for return statements that might exit before emails
  const lines = content.split('\n');
  let inPostRoute = false;
  let returnBeforeEmail = false;
  
  lines.forEach((line, index) => {
    if (line.includes('router.post') && line.includes('auth')) {
      inPostRoute = true;
    }
    
    if (inPostRoute && line.includes('return res.') && 
        !line.includes('error') && !line.includes('400') && !line.includes('500')) {
      // Check if there are email calls after this return
      const remainingLines = lines.slice(index + 1);
      const hasEmailAfter = remainingLines.some(l => l.includes('emailService'));
      if (hasEmailAfter) {
        returnBeforeEmail = true;
        console.log(`   ⚠️  Early return on line ${index + 1}: ${line.trim()}`);
      }
    }
  });
  
  if (returnBeforeEmail) {
    console.log('   ⚠️  Found early returns that might skip email sending');
  }
  
  console.log('\n📝 RECOMMENDATIONS:');
  
  if (!emailServiceImport) {
    console.log('   1. Add: const emailService = require("../services/emailService");');
  }
  
  if (!hasAsyncAwait) {
    console.log('   2. Use await with email service calls');
  }
  
  if (!emailCallsInTryCatch) {
    console.log('   3. Wrap email calls in try-catch blocks to handle errors');
  }
  
  if (returnBeforeEmail) {
    console.log('   4. Move email sending before success response');
  }
  
  console.log('   5. Add console.log statements around email calls for debugging');
  
} catch (error) {
  console.error('❌ Error reading booking route file:', error.message);
  console.log('\n📝 Make sure you\'re running this from the server directory');
  console.log('Expected file path:', bookingRoutePath);
}