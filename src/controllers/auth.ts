import { Request, Response, NextFunction } from 'express';

import AuthVerificationToken from 'models/AuthVerificationToken';
import User from 'models/User';
import { sendVerificationMail } from 'utils/email';
import { createToken, sendErrorResponse } from 'utils/helpers';
import { asyncHandler } from 'middlewares/async';

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: { name, email, password },
    } = req;

    const isEmailAlreadyExist = await User.findOne({ email });
    if (isEmailAlreadyExist)
      return sendErrorResponse(
        res,
        'Email was already taken, please enter another email',
        422
      );

    const user = await User.create({ name, email, password });
    const token = createToken();

    await AuthVerificationToken.create({ owner: user?._id, token });
    const link = `http://localhost:5000/verify?id=${user?._id}&token=${token}`;

    const info = await sendVerificationMail(link, {
      name,
      email,
      userId: user._id.toString(),
    });
    console.log(info);
    return res.status(201).json({
      status: 'success',
      data: { data: 'Please check your inbox to verify your account' },
    });
  }
);
