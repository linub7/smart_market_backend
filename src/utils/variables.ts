const { env } = process as { env: { [key: string]: string } };

export const {
  DATABASE_URL,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  JWT_TOKEN,
  NODE_ENV,
  VERIFICATION_LINK,
  SMTP_HOST,
  PASSWORD_RESET_LINK,
} = env;
