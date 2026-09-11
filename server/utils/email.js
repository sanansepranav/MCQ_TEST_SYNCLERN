const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const config = require('../config');

/**
 * Get or create an active email transporter (SMTP / Dev Fallback).
 */
const getTransporter = () => {
  const isRealSmtp =
    config.smtp.host &&
    config.smtp.user &&
    config.smtp.pass &&
    !config.smtp.user.includes('example.com') &&
    config.smtp.pass !== 'testpassword';

  if (isRealSmtp) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }

  // Fallback to console logger in dev/testing
  return {
    sendMail: async (options) => {
      console.log('\n╔══════════════════════════════════════════════════╗');
      console.log('║ ✉️  [SyncTest Simulated Email]                   ║');
      console.log('╠══════════════════════════════════════════════════╣');
      console.log(`║ To:      ${options.to.padEnd(39)}║`);
      console.log(`║ Subject: ${options.subject.substring(0, 39).padEnd(39)}║`);
      if (options.text) {
        console.log(`║ Text:    ${options.text.substring(0, 39).padEnd(39)}║`);
      }
      console.log('╚══════════════════════════════════════════════════╝\n');
      return { messageId: 'simulated-' + Date.now() };
    },
  };
};

/**
 * General email sender for password resets, alerts, etc.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`📨 Sending email to: ${to} | Subject: ${subject}`);

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return sgMail.send({
      to,
      from: {
        email: config.smtp.user || 'support@synctest.com',
        name: 'SyncTest Platform',
      },
      subject,
      text: text || subject,
      html,
    });
  }

  const transporter = getTransporter();
  return transporter.sendMail({
    from: `"SyncTest" <${config.smtp.user || 'no-reply@synctest.com'}>`,
    to,
    subject,
    text: text || subject,
    html,
  });
};

/**
 * OTP email sender for student verification.
 */
const sendOTPEmail = async (email, otp, name) => {
  console.log(`🔐 Sending OTP to: ${email} | Name: ${name}`);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #2563eb; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">SyncTest</h1>
        <p style="color: #bfdbfe; margin: 4px 0 0; font-size: 13px;">Online Examination & Assessment Platform</p>
      </div>
      <div>
        <h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 12px;">Hello ${name || 'Student'}!</h2>
        <p style="color: #475569; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
          Thank you for signing up with SyncTest. Use the verification code below to complete your registration:
        </p>
        <div style="background: #eff6ff; border: 2px dashed #2563eb; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="color: #1d4ed8; font-size: 38px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">${otp}</span>
          <p style="color: #64748b; font-size: 12px; margin: 8px 0 0;">Valid for 10 minutes</p>
        </div>
        <p style="color: #dc2626; font-size: 12px; margin: 0 0 16px;">
          🔒 Never share this OTP with anyone. SyncTest representatives will never ask for your code.
        </p>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
        © 2026 SyncTest. Built for secure online examinations.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Your SyncTest Verification Code: ${otp}`,
    text: `Your SyncTest OTP code is: ${otp}. It is valid for 10 minutes.`,
    html,
  });
};

module.exports = { sendEmail, sendOTPEmail };
