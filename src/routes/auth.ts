import { Router } from 'express';

import { signin, signup, verifyEmail, myInfo } from 'controllers/auth';
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
router.get('/me', isAuth, myInfo);

export default router;
