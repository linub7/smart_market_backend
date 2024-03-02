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
