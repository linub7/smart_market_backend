import { Request, Response } from 'express';

import { asyncHandler } from 'middlewares/async';
import User from 'models/User';
import { formatUser, sendErrorResponse } from 'utils/helpers';

export const getPublicProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { id },
    } = req;

    const profile = await User.findById(id);
    if (!profile) return sendErrorResponse(res, 'User not found', 404);

    return res.json({
      status: 'success',
      data: { profile: formatUser(profile) },
    });
  }
);
