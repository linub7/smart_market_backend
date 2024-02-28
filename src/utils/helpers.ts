import crypto from 'crypto';
import { Response } from 'express';

export const createToken = (): string => {
  const token = crypto.randomBytes(36).toString('hex');
  return token;
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number
) => res.status(statusCode).json({ status: 'fail', message });
