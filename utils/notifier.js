import nodemailer from 'nodemailer';
import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

webpush.setVapidDetails(
  'mailto:' + process.env.FROM_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendEmail(to, subject, html){
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
}

export async function sendPush(subscription, payload){
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
