import { Request, Response } from 'express';

import { asyncHandler } from 'middlewares/async';
import Product from 'models/Product';
import { sendErrorResponse } from 'utils/helpers';
import { uploadImage } from 'utils/upload';

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      user: { id },
      body: { name, description, price, category },
      files: { images },
    } = req;

    const newProduct = new Product({
      owner: id,
      name,
      description,
      price: parseFloat(price),
      category,
    });

    const isMultipleImages = Array.isArray(images);

    if (isMultipleImages && images?.length > 4)
      return sendErrorResponse(res, 'Max images count is 4', 422);

    // validate part
    let invalidFileType = false;
    if (isMultipleImages) {
      // multiple images
      for (const image of images) {
        if (!image.mimetype?.startsWith('image')) {
          invalidFileType = true;
          break;
        }
      }
    } else {
      if (images) {
        if (!images.mimetype?.startsWith('image')) {
          invalidFileType = true;
        }
      }
    }

    if (invalidFileType)
      return sendErrorResponse(
        res,
        'Invalid image type, file must be image type',
        422
      );

    // upload part
    if (isMultipleImages) {
      const uploadPromise = images.map((file) =>
        uploadImage(file.filepath, 1280, 720, 'fill', false)
      );
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromise);
      // add the images url and public id to the product's images filed
      newProduct.images = uploadResults.map(({ secure_url, public_id }) => {
        return { url: secure_url, publicId: public_id };
      });

      newProduct.thumbnail = newProduct.images[0].url;
    } else {
      if (images) {
        const { secure_url, public_id } = await uploadImage(
          images.filepath,
          1280,
          720,
          'fill',
          false
        );
        newProduct.images = [{ url: secure_url, publicId: public_id }];
        newProduct.thumbnail = secure_url;
      }
    }

    await newProduct.save();

    return res
      .status(201)
      .json({ status: 'success', data: { product: newProduct } });
  }
);
