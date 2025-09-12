// server/services/emailService.js - DEBUG VERSION
require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    console.log('🔧 Initializing EmailService...');
    
    // Initialize transporter with the same config that works in your test
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim()
      },
      debug: true, // Enable debugging
      logger: true, // Enable logging
      // More permissive TLS settings (same as your working test)
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1',
        ciphers: 'ALL'
      },
      // Increase timeouts (same as your working test)
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });

    // Create fallback transporter
    this.fallbackTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim()
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('📧 EmailService initialized');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
    console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL : 'Missing');
  }

  // Helper method to send email with fallback
  async sendEmailWithFallback(mailOptions, description = 'Email') {
    console.log(`📧 === ${description.toUpperCase()} START ===`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   To: ${mailOptions.to}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    
    try {
      console.log(`📧 Attempting to send ${description} via primary transporter...`);
      
      // Try primary transporter first
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ ${description} sent successfully via primary transporter:`, result.messageId);
      console.log(`   Response: ${result.response}`);
      console.log(`📧 === ${description.toUpperCase()} SUCCESS ===`);
      
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error(`❌ Primary ${description} failed:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      // Try fallback transporter
      try {
        console.log(`🔄 Trying fallback transporter for ${description}...`);
        const fallbackResult = await this.fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ Fallback ${description} sent successfully:`, fallbackResult.messageId);
        console.log(`📧 === ${description.toUpperCase()} SUCCESS (FALLBACK) ===`);
        
        return { success: true, messageId: fallbackResult.messageId, usedFallback: true };
        
      } catch (fallbackError) {
        console.error(`❌ Fallback ${description} also failed:`, {
          message: fallbackError.message,
          code: fallbackError.code,
          command: fallbackError.command,
          response: fallbackError.response
        });
        console.error(`📧 === ${description.toUpperCase()} COMPLETE FAILURE ===`);
        throw fallbackError;
      }
    }
  }

  // Test email configuration
  async testEmailConfig() {
    console.log("🔑 === EMAIL CONFIG TEST START ===");
    try {
      console.log("🔑 Testing email configuration:");
      console.log("  EMAIL_USER:", process.env.EMAIL_USER);
      console.log("  EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
      console.log("  EMAIL_PASS length:", process.env.EMAIL_PASS?.length);
      console.log("  ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

      // Verify connection
      console.log("🔍 Verifying SMTP connection...");
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      
      // Send test email
      console.log("📧 Sending test email...");
      const testResult = await this.sendTestEmail();
      console.log("🔑 === EMAIL CONFIG TEST SUCCESS ===");
      
      return { success: true, message: 'Email configuration is valid', testResult };
    } catch (error) {
      console.error('❌ Email configuration error:');
      console.error("  Error:", error.message);
      console.error("  Code:", error.code);
      console.error("  Command:", error.command);
      console.error("  Response:", error.response);
      console.error("🔑 === EMAIL CONFIG TEST FAILED ===");
      throw error;
    }
  }

  // Send a test email
  async sendTestEmail() {
    console.log("🧪 === TEST EMAIL START ===");
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself first
      subject: 'Hall Booking System - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #28a745;">✅ Email Test Successful!</h2>
          <p>Your Hall Booking System email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
          <p><strong>Admin Email:</strong> ${process.env.ADMIN_EMAIL}</p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Test email');
  }
  
  async sendBookingNotification(bookingDetails) {
    console.log("📬 === BOOKING NOTIFICATION START ===");
    console.log("📬 Booking details received:", bookingDetails);
    
    // Check if ADMIN_EMAIL is set
    if (!process.env.ADMIN_EMAIL) {
      console.error('❌ ADMIN_EMAIL not set in environment variables');
      throw new Error('ADMIN_EMAIL not configured');
    }

    const {
      userName,
      userEmail,
      hallName = 'Conference Hall',
      purpose,
      bookingDate,
      startTime,
      endTime,
      department,
      userPhone = 'Not provided',
      bookingId
    } = bookingDetails;

    console.log("📬 Extracted booking data:", {
      userName, userEmail, hallName, purpose, bookingDate, startTime, endTime, department, userPhone, bookingId
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Hall Booking - ${hallName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Hall Booking Notification
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Hall:</td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Purpose:</td>
                <td style="padding: 8px;">${purpose}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 8px;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Time:</td>
                <td style="padding: 8px;">${startTime} - ${endTime}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                <td style="padding: 8px;">${department}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">User Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Name:</td>
                <td style="padding: 8px;">${userName}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px;">${userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Phone:</td>
                <td style="padding: 8px;">${userPhone}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              <strong>Status:</strong> Booking has been automatically confirmed.
            </p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated notification from the Hall Booking System.
          </p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Admin notification email');
  }

  async sendBookingConfirmation(bookingDetails) {
    console.log("✉️ === BOOKING CONFIRMATION START ===");
    console.log("✉️ Booking details received:", bookingDetails);
    
    const {
      userName,
      userEmail,
      hallName = 'Conference Hall',
      purpose,
      bookingDate,
      startTime,
      endTime,
      department,
      bookingId
    } = bookingDetails;

    // Validate required fields
    if (!userEmail) {
      console.error('❌ User email is required for confirmation');
      throw new Error('User email is required');
    }

    console.log("✉️ Extracted confirmation data:", {
      userName, userEmail, hallName, purpose, bookingDate, startTime, endTime, department, bookingId
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed - ${hallName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            Booking Confirmed
          </h2>
          
          <p>Dear ${userName},</p>
          <p>Your hall booking has been <strong style="color: #28a745;">confirmed</strong>. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Hall:</td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Purpose:</td>
                <td style="padding: 8px;">${purpose}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 8px;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Time:</td>
                <td style="padding: 8px;">${startTime} - ${endTime}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                <td style="padding: 8px;">${department}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;">
              <strong>Important:</strong> Please arrive on time and follow facility guidelines.
            </p>
          </div>

          <p>Thank you for using our Hall Booking System!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated confirmation from the Hall Booking System.
          </p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Confirmation email');
  }

  async sendStatusUpdateEmail(statusDetails) {
    console.log("📊 === STATUS UPDATE EMAIL START ===");
    console.log("📊 Status details received:", statusDetails);
    
    const {
      bookingId,
      userName,
      userEmail,
      hallName = 'Conference Hall',
      purpose,
      bookingDate,
      startTime,
      endTime,
      department,
      status,
      adminNote
    } = statusDetails;

    if (!userEmail) {
      console.error('❌ User email is required for status update');
      throw new Error('User email is required');
    }

    const statusColor = status === 'confirmed' ? '#28a745' : status === 'cancelled' ? '#dc3545' : '#ffc107';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking ${statusText} - ${hallName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor}; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">
            Booking ${statusText}
          </h2>
          
          <p>Dear ${userName},</p>
          <p>Your hall booking status has been updated to <strong style="color: ${statusColor};">${status}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Hall:</td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Purpose:</td>
                <td style="padding: 8px;">${purpose}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 8px;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Time:</td>
                <td style="padding: 8px;">${startTime} - ${endTime}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                <td style="padding: 8px;">${department}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px; color: ${statusColor}; font-weight: bold;">${statusText}</td>
              </tr>
            </table>
          </div>

          ${adminNote ? `
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #333; margin-top: 0;">Admin Note:</h4>
            <p style="margin: 0; color: #555;">${adminNote}</p>
          </div>
          ` : ''}

          <p>Thank you for using our Hall Booking System!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated notification from the Hall Booking System.
          </p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Status update email');
  }

  async sendCancellationNotification(cancellationDetails) {
    console.log("🚫 === CANCELLATION NOTIFICATION START ===");
    console.log("🚫 Cancellation details received:", cancellationDetails);
    
    const {
      bookingId,
      userName,
      userEmail,
      hallName = 'Conference Hall',
      purpose,
      bookingDate,
      startTime,
      endTime,
      department
    } = cancellationDetails;

    if (!userEmail) {
      console.error('❌ User email is required for cancellation notification');
      throw new Error('User email is required');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Cancelled - ${hallName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            Booking Cancelled
          </h2>
          
          <p>Dear ${userName},</p>
          <p>Your hall booking has been <strong style="color: #dc3545;">cancelled</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Cancelled Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Hall:</td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Purpose:</td>
                <td style="padding: 8px;">${purpose}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 8px;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Time:</td>
                <td style="padding: 8px;">${startTime} - ${endTime}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                <td style="padding: 8px;">${department}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #721c24;">
              <strong>Cancellation Confirmed:</strong> The time slot is now available for others.
            </p>
          </div>

          <p>Thank you for using our Hall Booking System!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated notification from the Hall Booking System.
          </p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Cancellation email');
  }

  async sendAdminCancellationNotification(cancellationDetails) {
    console.log("🚫📬 === ADMIN CANCELLATION NOTIFICATION START ===");
    console.log("🚫📬 Cancellation details received:", cancellationDetails);
    
    if (!process.env.ADMIN_EMAIL) {
      console.error('❌ ADMIN_EMAIL not set in environment variables');
      throw new Error('ADMIN_EMAIL not configured');
    }

    const {
      bookingId,
      userName,
      userEmail,
      hallName = 'Conference Hall',
      purpose,
      bookingDate,
      startTime,
      endTime,
      department
    } = cancellationDetails;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `Booking Cancelled - ${hallName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            Booking Cancellation Notice
          </h2>
          
          <p>A hall booking has been cancelled by the user.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc3545; margin-top: 0;">Cancelled Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">User:</td>
                <td style="padding: 8px;">${userName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px;">${userEmail}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Hall:</td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Purpose:</td>
                <td style="padding: 8px;">${purpose}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Date:</td>
                <td style="padding: 8px;">${bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #555;">Time:</td>
                <td style="padding: 8px;">${startTime} - ${endTime}</td>
              </tr>
              <tr style="background-color: #fff;">
                <td style="padding: 8px; font-weight: bold; color: #555;">Department:</td>
                <td style="padding: 8px;">${department}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>Time Slot Available:</strong> This time slot is now available for new bookings.
            </p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
            This is an automated notification from the Hall Booking System.
          </p>
        </div>
      `
    };

    return await this.sendEmailWithFallback(mailOptions, 'Admin cancellation notification');
  }
}

module.exports = new EmailService();