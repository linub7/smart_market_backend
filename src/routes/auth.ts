import { Router } from 'express';

import {
  signin,
  signup,
  verifyEmail,
  myInfo,
  generateVerificationLink,
  grantAccessToken,
  signout,
  generateForgetPasswordLink,
  grantValid,
  updatePassword,
} from 'controllers/auth';
import {
  ForgotPasswordSchema,
  SigninUserSchema,
  SignupUserSchema,
  UpdatePasswordSchema,
  VerifyTokenSchema,
} from 'utils/validationSchema';
import { validate } from 'middlewares/validator';
import { isAuth, isValidPasswordResetToken } from 'middlewares/auth';

const router = Router();

router.post('/signup', validate(SignupUserSchema), signup);
router.post('/signin', validate(SigninUserSchema), signin);
router.post('/verify-email', validate(VerifyTokenSchema), verifyEmail);
router.post('/verify-token', isAuth, generateVerificationLink);
router.post('/refresh-token', grantAccessToken);
router.post('/signout', isAuth, signout);
router.post(
  '/forget-password',
  validate(ForgotPasswordSchema),
  generateForgetPasswordLink
);
router.post(
  '/verify-password-reset-token',
  validate(VerifyTokenSchema),
  isValidPasswordResetToken,
  grantValid
);
router.post(
  '/reset-password',
  validate(UpdatePasswordSchema),
  isValidPasswordResetToken,
  updatePassword
);
router.get('/me', isAuth, myInfo);

export default router;
