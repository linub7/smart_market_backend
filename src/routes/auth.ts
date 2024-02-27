import { Router } from 'express';

import { signup } from 'controllers/auth';
import { SignupUserSchema } from 'utils/validationSchema';
import { validate } from 'middlewares/validator';

const router = Router();

router.post('/signup', validate(SignupUserSchema), signup);

export default router;
