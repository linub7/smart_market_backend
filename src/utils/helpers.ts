import crypto from 'crypto';

export const createToken = (): string => {
  const token = crypto.randomBytes(36).toString('hex');
  return token;
};
