// debug-issues.js - Debug script for PDF and Email issues
require('dotenv').config();
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Test PDF Generation
async function testPDFGeneration() {
  console.log('\n=== TESTING PDF GENERATION ===');
  
  try {
    console.log('1. Testing PDFKit installation...');
    const doc = new PDFDocument();
    console.log('✅ PDFKit loaded successfully');
    
    console.log('2. Creating test PDF...');
    const outputPath = path.join(__dirname, 'test-report.pdf');
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);
    
    doc.fontSize(20)
       .text('TEST PDF GENERATION', { align: 'center' })
       .fontSize(12)
       .text('This is a test PDF to verify PDFKit is working correctly.')
       .text(`Generated at: ${new Date().toLocaleString()}`);
    
    doc.end();
    
    stream.on('finish', () => {
      console.log('✅ Test PDF created successfully at:', outputPath);
      console.log('   File size:', fs.statSync(outputPath).size, 'bytes');
    });
    
    stream.on('error', (err) => {
      console.error('❌ Error creating test PDF:', err);
    });
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error);
  }
}

// Test Email Configuration
async function testEmailConfig() {
  console.log('\n=== TESTING EMAIL CONFIGURATION ===');
  
  try {
    console.log('1. Checking environment variables...');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
    console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not properly configured');
      return;
    }
    
    console.log('2. Testing email service...');
    const emailService = require('./services/emailService');
    
    const result = await emailService.testEmailConfig();
    console.log('✅ Email test successful:', result);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
  }
}

// Test Database Connection
async function testDatabaseConnection() {
  console.log('\n=== TESTING DATABASE CONNECTION ===');
  
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hall_booking');
    console.log('✅ Database connected successfully');
    
    console.log('2. Testing collection access...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('   Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Main debug function
async function runDebugTests() {
  console.log('🔍 STARTING DEBUG TESTS FOR PDF AND EMAIL ISSUES');
  console.log('================================================');
  
  await testPDFGeneration();
  await testEmailConfig();
  await testDatabaseConnection();
  
  console.log('\n🔍 DEBUG TESTS COMPLETED');
  console.log('========================');
  console.log('\nIf PDF generation works here but fails in the API:');
  console.log('1. Check server logs for specific error messages');
  console.log('2. Verify the API endpoint is being called correctly');
  console.log('3. Check if there are any middleware issues');
  console.log('\nIf email test fails:');
  console.log('1. Verify Gmail app password is correct');
  console.log('2. Check if 2FA is enabled on Gmail account');
  console.log('3. Ensure "Less secure app access" is configured if needed');
  
  process.exit(0);
}

// Run the debug tests
runDebugTests().catch(console.error);
