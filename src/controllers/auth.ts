import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';

import AuthVerificationToken from 'models/AuthVerificationToken';
import User from 'models/User';
import {
  sendVerificationMail,
  sendResetPasswordMail,
  sendUpdatePasswordMail,
} from 'utils/email';
import { createToken, sendErrorResponse } from 'utils/helpers';
import { asyncHandler } from 'middlewares/async';
import {
  JWT_TOKEN,
  PASSWORD_RESET_LINK,
  VERIFICATION_LINK,
} from 'utils/variables';
import PasswordResetToken from 'models/PasswordResetToken';

export const signup = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
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

    const link = `${VERIFICATION_LINK}?id=${user?._id}&token=${token}`;
    await sendVerificationMail(link, {
      name,
      email,
      userId: user._id.toString(),
    });

    return res.status(201).json({
      status: 'success',
      data: { message: 'Please check your inbox to verify your account' },
    });
  }
);

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const {
    body: { email, password },
  } = req;

  const existedUser = await User.findOne({ email });
  if (!existedUser) return sendErrorResponse(res, 'Invalid credentials.', 403);

  const matched = await existedUser.comparePassword(password);
  if (!matched) return sendErrorResponse(res, 'Invalid credentials.', 403);

  const payload = { id: existedUser?._id };
  const accessToken = JWT.sign(payload, JWT_TOKEN, {
    expiresIn: '15m',
  });
  const refreshToken = JWT.sign(payload, JWT_TOKEN);

  if (!existedUser?.tokens) existedUser.tokens = [refreshToken];
  else existedUser.tokens.push(refreshToken);

  await existedUser.save();

  const profile = {
    id: existedUser?._id,
    email: existedUser?.email,
    name: existedUser?.name,
    verified: existedUser?.verified,
  };

  res.json({
    status: 'success',
    data: { profile, tokens: { refreshToken, accessToken } },
  });
});

export const myInfo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    return res.json({
      status: 'success',
      data: {
        me: user,
      },
    });
  }
);

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      body: { id, token },
    } = req;

    const authToken = await AuthVerificationToken.findOne({ owner: id });
    if (!authToken) return sendErrorResponse(res, 'unauthorized request!', 403);

    const isMatched = await authToken.compareToken(token);
    if (!isMatched)
      return sendErrorResponse(
        res,
        'unauthorized request, invalid token!',
        403
      );

    await User.findByIdAndUpdate(
      id,
      { verified: true },
      { runValidators: true, new: true }
    );

    await AuthVerificationToken.findByIdAndDelete(authToken?._id);

    return res.json({
      status: 'success',
      data: {
        message: 'Thanks for joining us, your email verified successfully.',
      },
    });
  }
);

export const generateVerificationLink = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      user: { id, email, name, verified },
    } = req;

    if (verified)
      return sendErrorResponse(res, 'You verified your account already', 400);

    // remove previous token
    await AuthVerificationToken.findOneAndDelete({ owner: id });

    const token = createToken();
    await AuthVerificationToken.create({ owner: id, token });

    const link = `${VERIFICATION_LINK}?id=${id}&token=${token}`;
    await sendVerificationMail(link, {
      name,
      email,
      userId: id.toString(),
    });

    return res.status(201).json({
      status: 'success',
      data: { message: 'Token created successfully, Please check your inbox' },
    });
  }
);

export const grantAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      body: { refreshToken },
    } = req;

    if (!refreshToken)
      return sendErrorResponse(res, 'unauthorized request', 403);

    const payload = JWT.verify(refreshToken, JWT_TOKEN) as { id: string };
    if (!payload?.id)
      return sendErrorResponse(res, 'unauthorized request', 401);
    const existedUser = await User.findOne({
      _id: payload?.id,
      tokens: refreshToken,
    });

    if (!existedUser) {
      // user is compromised, remove all the previous tokens
      await User.findByIdAndUpdate(
        payload?.id,
        { tokens: [] },
        { new: true, runValidators: true }
      );
      return sendErrorResponse(res, 'unauthorized request', 401);
    }

    const newPayload = { id: existedUser?._id };
    const newAccessToken = JWT.sign(newPayload, JWT_TOKEN, {
      expiresIn: '15m',
    });
    const newRefreshToken = JWT.sign(newPayload, JWT_TOKEN);

    const filteredTokens = existedUser?.tokens?.filter(
      (refreshT: string) => refreshT !== refreshToken
    );
    existedUser.tokens = filteredTokens;
    existedUser.tokens.push(newRefreshToken);

    await existedUser.save();

    return res.json({
      status: 'success',
      data: {
        tokens: {
          refreshToken: newRefreshToken,
          accessToken: newAccessToken,
        },
      },
    });
  }
);

export const signout = asyncHandler(async (req: Request, res: Response) => {
  const {
    user: { id },
    body: { refreshToken },
  } = req;

  const existedUser = await User.findOne({ _id: id, tokens: refreshToken });
  if (!existedUser)
    return sendErrorResponse(res, 'unauthorized request, user not found!', 403);

  const filteredTokens = existedUser.tokens.filter(
    (refreshT: string) => refreshT !== refreshToken
  );
  existedUser.tokens = filteredTokens;
  await existedUser.save();

  return res.json({
    status: 'success',
    data: { message: 'Signout successfully done.' },
  });
});

export const generateForgetPasswordLink = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      body: { email },
    } = req;

    const existedUser = await User.findOne({ email });
    if (!existedUser) return sendErrorResponse(res, 'Account not found', 404);

    // Remove token
    await PasswordResetToken.findOneAndDelete({ owner: existedUser?._id });

    // create new token
    const token = createToken();
    await PasswordResetToken.create({ owner: existedUser?._id, token });

    // send the link to user's email
    const passwordResetLink = `${PASSWORD_RESET_LINK}?id=${existedUser?._id}&token=${token}`;
    await sendResetPasswordMail(passwordResetLink, {
      name: existedUser?.name,
      email: existedUser?.email,
      userId: existedUser?._id?.toString(),
    });

    // send response back
    return res.json({
      status: 'success',
      data: { message: 'Please check your inbox' },
    });
  }
);

export const grantValid = asyncHandler(async (_req: Request, res: Response) => {
  return res.json({ status: 'success', data: { valid: true } });
});

export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      body: { id, password },
    } = req;

    const existedUser = await User.findById(id);
    if (!existedUser)
      return sendErrorResponse(
        res,
        'Unauthorized request, invalid credentials!',
        403
      );

    const matched = await existedUser.comparePassword(password);
    if (matched)
      return sendErrorResponse(res, 'New password must be different!', 422);

    existedUser.password = password;
    await existedUser.save();

    await PasswordResetToken.findOneAndDelete({ owner: existedUser?._id });

    await sendUpdatePasswordMail('', {
      name: existedUser.name,
      email: existedUser.email,
      userId: existedUser._id.toString(),
    });

    return res.json({
      status: 'success',
      data: {
        message: 'Password resets successfully',
      },
    });
  }
);
