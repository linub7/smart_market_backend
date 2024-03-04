import { Router } from 'express';

import {
  signin,
  signup,
  verifyEmail,
  myInfo,
  generateVerificationLink,
  grantAccessToken,
  signout,
} from 'controllers/auth';
import {
  SigninUserSchema,
  SignupUserSchema,
  VerifyEmailSchema,
} from 'utils/validationSchema';
import { validate } from 'middlewares/validator';
import { isAuth } from 'middlewares/auth';

const router = Router();

router.post('/signup', validate(SignupUserSchema), signup);
router.post('/signin', validate(SigninUserSchema), signin);
router.post('/verify-email', validate(VerifyEmailSchema), verifyEmail);
router.post('/verify-token', isAuth, generateVerificationLink);
router.post('/refresh-token', grantAccessToken);
router.post('/signout', isAuth, signout);
router.get('/me', isAuth, myInfo);

export default router;
