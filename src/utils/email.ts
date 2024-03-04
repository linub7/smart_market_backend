import path from 'path';
import nodemailer from 'nodemailer';

import { MAILTRAP_PASS, MAILTRAP_USER, SMTP_HOST } from './variables';
import { generateTemplate } from 'mail/template';

const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: `${SMTP_HOST}`,
    port: 2525,
    auth: {
      user: `${MAILTRAP_USER}`,
      pass: `${MAILTRAP_PASS}`,
    },
  });

  return transport;
};

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export const sendVerificationMail = async (link: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}, welcome to Smart Market! There are so much thing that we do for verified users. Use the given OTP to verify your email.`;

  transport.sendMail({
    to: email,
    from: 'myapp@auth.com',
    subject: 'Welcome message',
    html: generateTemplate({
      title: 'Welcome to Smart Market',
      message: welcomeMessage,
      logo: 'cid:logo',
      banner: 'cid:welcome',
      link,
      btnTitle: 'Please click here to verify your account',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../mail/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'welcome.png',
        path: path.join(__dirname, '../mail/welcome.png'),
        cid: 'welcome',
      },
    ],
  });
};

export const sendResetPasswordMail = async (link: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}. If you forgot your password, then click on the link below. If you did not forgot your password, ignore this email.`;

  transport.sendMail({
    to: email,
    from: 'myapp@auth.com',
    subject: 'Forgot Your Password',
    html: generateTemplate({
      title: 'Welcome to Smart Market',
      message: welcomeMessage,
      logo: 'cid:logo',
      banner: 'cid:welcome',
      link,
      btnTitle: 'Please click here to navigate reset password page',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../mail/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'welcome.png',
        path: path.join(__dirname, '../mail/welcome.png'),
        cid: 'welcome',
      },
    ],
  });
};

export const sendUpdatePasswordMail = async (
  link: string,
  profile: Profile
) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}. You updated your password successfully, join app and enjoy.`;

  transport.sendMail({
    to: email,
    from: 'myapp@auth.com',
    subject: 'Updated Password',
    html: generateTemplate({
      title: 'Welcome to Smart Market',
      message: welcomeMessage,
      logo: 'cid:logo',
      banner: 'cid:welcome',
      link,
      btnTitle: 'Congratulations, your updating password done.',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../mail/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'welcome.png',
        path: path.join(__dirname, '../mail/welcome.png'),
        cid: 'welcome',
      },
    ],
  });
};
