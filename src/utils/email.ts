import path from 'path';
import nodemailer from 'nodemailer';

import { MAILTRAP_PASS, MAILTRAP_USER } from './variables';
import { generateTemplate } from 'mail/template';

const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
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
      link: link,
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
