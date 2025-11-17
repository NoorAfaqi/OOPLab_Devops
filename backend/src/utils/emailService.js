const nodemailer = require('nodemailer');
const { logger } = require('../middleware/errorHandler');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    logger.error('Email service configuration error:', error);
    return false;
  }
};

// Send thank you email to subscriber
const sendSubscriptionConfirmationEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"OOPLab Team" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to subscribe@ooplab.org
      cc: email, // Keep subscriber email in CC
      subject: 'Thank You for Subscribing to OOPLab',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Subscribing</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #007AFF;">
                <h1 style="color: #ffffff; margin: 0;">OOPLab</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px; background-color: #ffffff;">
                <h2 style="color: #333333; margin-top: 0;">Thank You for Subscribing!</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                  Dear Subscriber,
                </p>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                  Thank you for subscribing to OOPLab! We're excited to have you as part of our community.
                </p>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                  You'll now receive the latest updates, announcements, and insights from our team.
                </p>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                  Stay tuned for exciting content!
                </p>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                  Best regards,<br>
                  <strong>The OOPLab Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f4f4f4;">
                <p style="color: #999999; font-size: 14px; margin: 0;">
                  © ${new Date().getFullYear()} OOPLab.org. All rights reserved.
                </p>
                <p style="color: #999999; font-size: 12px; margin: 5px 0 0 0;">
                  <a href="https://ooplab.org" style="color: #007AFF; text-decoration: none;">Visit our website</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Thank You for Subscribing to OOPLab!
        
        Dear Subscriber,
        
        Thank you for subscribing to OOPLab! We're excited to have you as part of our community.
        
        You'll now receive the latest updates, announcements, and insights from our team.
        
        Stay tuned for exciting content!
        
        Best regards,
        Team OOPLab
        
        © ${new Date().getFullYear()} OOPLab.org. All rights reserved.
        Visit our website: https://ooplab.org
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending subscription confirmation email:', error);
    throw error;
  }
};

// Send email with custom content
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `"OOPLab Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send contact form notification email
const sendContactNotificationEmail = async ({ name, email, company, subject, message }) => {
  try {
    const companyText = company ? `Company: ${company}<br>` : '';
    
    const mailOptions = {
      from: `"OOPLab Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to subscribe@ooplab.org
      cc: email, // Keep contactor email in CC
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 20px 0; text-align: center; background-color: #007AFF;">
                <h1 style="color: #ffffff; margin: 0;">OOPLab</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px; background-color: #ffffff;">
                <h2 style="color: #333333; margin-top: 0;">New Contact Form Submission</h2>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #333333;">Name:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #666666;">
                      ${name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #333333;">Email:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #666666;">
                      <a href="mailto:${email}" style="color: #007AFF; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  ${company ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #333333;">Company:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #666666;">
                      ${company}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #333333;">Subject:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #666666;">
                      ${subject}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #333333;">Message:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; color: #666666;">
                      ${message}
                    </td>
                  </tr>
                </table>

                <p style="color: #666666; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                  Please respond to this inquiry as soon as possible.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f4f4f4;">
                <p style="color: #999999; font-size: 14px; margin: 0;">
                  © ${new Date().getFullYear()} OOPLab.org. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        ${company ? `Company: ${company}\n` : ''}
        Subject: ${subject}
        
        Message:
        ${message}
        
        Please respond to this inquiry as soon as possible.
        
        © ${new Date().getFullYear()} OOPLab.org. All rights reserved.
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending contact notification email:', error);
    throw error;
  }
};

// Send newsletter to all subscribers
const sendNewsletter = async (subject, html, subscriberEmails) => {
  try {
    const BATCH_SIZE = 100; // Most SMTP services allow up to 500, we use 100 for safety
    const totalSubscribers = subscriberEmails.length;
    let sentCount = 0;
    const errors = [];

    // Send in batches to ensure all subscribers receive the email
    for (let i = 0; i < subscriberEmails.length; i += BATCH_SIZE) {
      const batch = subscriberEmails.slice(i, i + BATCH_SIZE);
      
      try {
        const mailOptions = {
          from: `"OOPLab Team" <${process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER, // Send to admin
          bcc: batch, // Subscribers in BCC (batch)
          subject: subject,
          html: html,
          text: html.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text version
        };
        
        const info = await transporter.sendMail(mailOptions);
        sentCount += batch.length;
      } catch (batchError) {
        logger.error(`Error sending newsletter batch ${i / BATCH_SIZE + 1}:`, batchError.message);
        errors.push({ batch: i / BATCH_SIZE + 1, error: batchError.message });
      }
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subscriberEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (errors.length > 0) {
      logger.error('Newsletter sent with some errors:', errors);
      return { success: true, messageId: 'batch', sentCount, errors };
    }

    return { success: true, messageId: 'batch', sentCount };
  } catch (error) {
    logger.error('Error sending newsletter:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  testEmailConfig,
  sendSubscriptionConfirmationEmail,
  sendEmail,
  sendContactNotificationEmail,
  sendNewsletter
};

