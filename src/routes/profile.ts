import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { getPublicProfile } from 'controllers/profile';
import { sendErrorResponse } from 'utils/helpers';
import { isAuth } from 'middlewares/auth';

const router = Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return sendErrorResponse(res, 'Please enter valid id', 422);
  }
  next();
});

router.route('/:id').get(isAuth, getPublicProfile);

export default router;
