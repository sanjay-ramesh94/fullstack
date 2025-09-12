// fixedTLSEmailTest.js
require("dotenv").config();
const nodemailer = require('nodemailer');

console.log("Environment check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim()
  },
  debug: true,
  logger: true,
  // More permissive TLS settings
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1',
    ciphers: 'ALL'
  },
  // Increase timeouts
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

async function testConnection() {
  try {
    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!");
    
    console.log("Sending test email...");
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Hall Booking System',
      text: 'This is a test email to verify the email configuration is working.',
      html: '<h2>✅ Email Configuration Working!</h2><p>Your Hall Booking System can send emails successfully.</p>'
    });
    
    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", result.messageId);
    console.log("Check your email inbox!");
    
  } catch (error) {
    console.error("❌ Test failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    
    // Try alternative: Use service shorthand as fallback
    if (error.code === 'ESOCKET' && error.message.includes('TLS')) {
      console.log("🔄 Trying fallback configuration...");
      
      const fallbackTransporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER?.trim(),
          pass: process.env.EMAIL_PASS?.trim()
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      try {
        await fallbackTransporter.verify();
        console.log("✅ Fallback SMTP connection successful!");
        
        const result = await fallbackTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'Test Email from Hall Booking System (Fallback)',
          html: '<h2>✅ Email Working with Fallback Config!</h2>'
        });
        
        console.log("✅ Fallback email sent successfully!");
        console.log("Message ID:", result.messageId);
        console.log("Use the 'service: gmail' configuration in your emailService.js");
        
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError.message);
      }
    }
  } finally {
    process.exit(0);
  }
}

testConnection();