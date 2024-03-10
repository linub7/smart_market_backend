import { NextFunction, Request, Response } from 'express';
import JWT, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from 'jsonwebtoken';

import { asyncHandler } from './async';
import { JWT_TOKEN } from 'utils/variables';
import User from 'models/User';
import { sendErrorResponse } from 'utils/helpers';
import PasswordResetToken from 'models/PasswordResetToken';
import { sendResetPasswordMail } from 'utils/email';

export const isAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken = req.headers.authorization;
      if (!authToken)
        return sendErrorResponse(res, 'Unauthorized request', 403);

      const token = authToken.split('Bearer ')[1];
      const payload = JWT.verify(token, JWT_TOKEN) as { id: string };

      const user = await User.findById(payload?.id);
      if (!user) return sendErrorResponse(res, 'Unauthorized request', 403);

      req.user = {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        verified: user?.verified,
        avatar: user?.avatar?.url,
      };
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError)
        return sendErrorResponse(res, 'Session expired', 401);
      if (error instanceof JsonWebTokenError)
        return sendErrorResponse(res, 'Unauthorized access', 401);

      next(error);
    }
  }
);

export const isValidPasswordResetToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: { id, token },
    } = req;

    const resetPasswordToken = await PasswordResetToken.findOne({ owner: id });
    if (!resetPasswordToken)
      return sendErrorResponse(
        res,
        'Unauthorized request, invalid credentials!',
        401
      );

    const matched = await resetPasswordToken.compareToken(token);
    if (!matched)
      return sendErrorResponse(
        res,
        'Unauthorized request, invalid credentials!',
        401
      );

    next();
  }
);
