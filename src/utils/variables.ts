const { env } = process as { env: { [key: string]: string } };

export const { DATABASE_URL, MAILTRAP_USER, MAILTRAP_PASS, JWT_TOKEN } = env;
