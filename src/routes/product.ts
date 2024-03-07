import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteSingleImageFromProduct,
  getSingleProduct,
  getProductsByCategory,
  getLatestProducts,
  getAllMyProducts,
} from 'controllers/product';
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

router
  .route('/')
  .get(isAuth, getAllMyProducts)
  .post(isAuth, fileParser, validate(CreateProductSchema), createProduct);

router.get('/latest', getLatestProducts);

router
  .route('/:id')
  .get(isAuth, getSingleProduct)
  .patch(isAuth, fileParser, validate(CreateProductSchema), updateProduct)
  .delete(isAuth, deleteProduct);

router.delete('/:id/images/:imageId', isAuth, deleteSingleImageFromProduct);
router.get('/categories/:category', getProductsByCategory);

export default router;
