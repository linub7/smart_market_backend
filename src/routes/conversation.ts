import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { getOrCreateConversation } from 'controllers/conversation';
import { sendErrorResponse } from 'utils/helpers';
import { isAuth } from 'middlewares/auth';

const router = Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return sendErrorResponse(res, 'Please enter valid id', 422);
  }
  next();
});

router.route('/:id').get(isAuth, getOrCreateConversation);

export default router;
