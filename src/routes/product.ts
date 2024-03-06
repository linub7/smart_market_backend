import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { createProduct } from 'controllers/product';
import { sendErrorResponse } from 'utils/helpers';
import { isAuth } from 'middlewares/auth';
import { validate } from 'middlewares/validator';
import fileParser from 'middlewares/fileParser';
import { CreateProductSchema } from 'utils/validationSchema';

const router = Router();

router.param('id', (req, res, next, val) => {
  if (!isValidObjectId(val)) {
    return sendErrorResponse(res, 'Please enter valid id', 422);
  }
  next();
});

router.post(
  '/',
  isAuth,
  fileParser,
  validate(CreateProductSchema),
  createProduct
);

export default router;
