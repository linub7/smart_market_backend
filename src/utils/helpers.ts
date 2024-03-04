import crypto from 'crypto';
import { Response } from 'express';
import { UserDocument } from 'src/@types/user';

export const createToken = (): string => {
  const token = crypto.randomBytes(36).toString('hex');
  return token;
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number
) => res.status(statusCode).json({ status: 'fail', message });

export const formatUser = (user: UserDocument) => {
  return {
    id: user?._id,
    name: user?.name,
    email: user?.email,
    verified: user?.verified,
    avatar: user?.avatar?.url,
  };
};
