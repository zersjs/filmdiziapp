import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const templates = {
  verifyEmail: ({ username, verificationUrl }) => ({
    subject: 'SINEFIX - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 SINEFIX</h1>
              <p>Welcome to the ultimate streaming experience!</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>Thank you for registering with SINEFIX. Please verify your email address to get started.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SINEFIX. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  resetPassword: ({ username, resetUrl }) => ({
    subject: 'SINEFIX - Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 SINEFIX</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>We received a request to reset your password. Click the button below to reset it:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 30 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2024 SINEFIX. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  welcomeEmail: ({ username }) => ({
    subject: 'Welcome to SINEFIX!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Welcome to SINEFIX!</h1>
              <p>Your ultimate streaming destination</p>
            </div>
            <div class="content">
              <h2>Hello ${username}!</h2>
              <p>Welcome aboard! We're excited to have you join our community.</p>
              <p>Here's what you can do with SINEFIX:</p>
              <div class="feature">
                <strong>🎥 Unlimited Streaming</strong>
                <p>Access thousands of movies and TV shows</p>
              </div>
              <div class="feature">
                <strong>⭐ Personalized Recommendations</strong>
                <p>Get suggestions based on your taste</p>
              </div>
              <div class="feature">
                <strong>📱 Watch Anywhere</strong>
                <p>Stream on any device, anytime</p>
              </div>
              <div class="feature">
                <strong>💬 Social Features</strong>
                <p>Connect with friends and share reviews</p>
              </div>
              <p>Start exploring now and discover your next favorite show!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SINEFIX. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async ({ to, subject, template, context }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    let emailContent = { subject, html: '' };

    if (template && templates[template]) {
      emailContent = templates[template](context);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent to ${to}: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results;
};

export default { sendEmail, sendBulkEmails };
