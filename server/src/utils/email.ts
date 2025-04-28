import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info('Email sent:', info.messageId);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}; 