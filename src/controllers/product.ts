import { Request, Response } from 'express';

import { MAX_PRODUCT_IMAGES_COUNT } from 'constants/index';
import { cloudAPI } from 'cloud/index';
import { asyncHandler } from 'middlewares/async';
import Product from 'models/Product';
import { UserDocument } from 'src/@types/user';
import categories from 'utils/categories';
import { formatProduct, sendErrorResponse } from 'utils/helpers';
import {
  destroyImageFromCloudinary,
  uploadImageToCloudinary,
} from 'utils/upload';

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

    if (isMultipleImages && images?.length > MAX_PRODUCT_IMAGES_COUNT)
      return sendErrorResponse(
        res,
        `max images count is ${MAX_PRODUCT_IMAGES_COUNT}`,
        422
      );

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
        uploadImageToCloudinary(file.filepath, 1280, 720, 'fill', false)
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
        const { secure_url, public_id } = await uploadImageToCloudinary(
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

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { id },
      user,
      body: { name, description, price, category, thumbnail },
      files: { images },
    } = req;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, owner: user.id },
      { name, description, price: parseFloat(price), category },
      { new: true, runValidators: true }
    );
    if (!updatedProduct)
      return sendErrorResponse(res, 'Product not found', 404);

    if (typeof thumbnail === 'string') updatedProduct.thumbnail = thumbnail;

    if (updatedProduct?.images?.length >= MAX_PRODUCT_IMAGES_COUNT)
      return sendErrorResponse(
        res,
        `Product has already ${MAX_PRODUCT_IMAGES_COUNT} images`,
        422
      );

    const isMultipleImages = Array.isArray(images);

    if (isMultipleImages) {
      if (
        updatedProduct.images.length + images?.length >
        MAX_PRODUCT_IMAGES_COUNT
      )
        return sendErrorResponse(
          res,
          `Max images count is ${MAX_PRODUCT_IMAGES_COUNT}`,
          422
        );
    }

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
        uploadImageToCloudinary(file.filepath, 1280, 720, 'fill', false)
      );
      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromise);
      // add the images url and public id to the product's images filed
      const newImages = uploadResults.map(({ secure_url, public_id }) => {
        return { url: secure_url, publicId: public_id };
      });

      updatedProduct.images.push(...newImages);
    } else {
      if (images) {
        const { secure_url, public_id } = await uploadImageToCloudinary(
          images.filepath,
          1280,
          720,
          'fill',
          false
        );
        updatedProduct.images.push({ url: secure_url, publicId: public_id });
      }
    }
    await updatedProduct.save();

    return res.json({ status: 'success', data: { product: updatedProduct } });
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { id },
      user,
    } = req;

    const deletedProduct = await Product.findOneAndDelete({
      _id: id,
      owner: user.id,
    });

    if (!deletedProduct)
      return sendErrorResponse(res, 'Product not found', 404);

    if (deletedProduct.images?.length) {
      const publicIDs = deletedProduct?.images.map(({ publicId }) => publicId);
      await cloudAPI.delete_resources(publicIDs);
    }

    return res.json({
      status: 'success',
      data: { message: 'Product deleted successfully!' },
    });
  }
);

export const deleteSingleImageFromProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      user,
      params: { id, imageId },
    } = req;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, owner: user.id },
      {
        $pull: {
          images: { publicId: imageId },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return sendErrorResponse(res, 'Product not found', 404);

    if (updatedProduct.thumbnail?.includes(imageId)) {
      updatedProduct.thumbnail = updatedProduct.images[0]?.url;
      await updatedProduct.save();
    }

    await destroyImageFromCloudinary(imageId);

    return res.json({ status: 'success', data: { product: updatedProduct } });
  }
);

export const getAllMyProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      user: { id },
    } = req;
    const { page = '1', limit = '10' } = req.query as {
      page: string;
      limit: string;
    };

    const convertedPage = parseInt(page, 10) || 1;
    const convertedLimit = parseInt(limit, 10) || 10;
    const startIndex = (convertedPage - 1) * convertedLimit;

    const products = await Product.find({ owner: id })
      .populate<{
        owner: UserDocument;
      }>('owner', 'id name avatar')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(convertedLimit);

    const formattedProducts = products.map((product) => {
      return {
        id: product._id,
        name: product.name,
        description: product.description,
        thumbnail: product.thumbnail,
        category: product.category,
        price: product.price,
        date: product.purchasingDate,
        images: product?.images?.map(({ url }) => url),
        seller: {
          id: product.owner._id,
          name: product.owner.name,
          avatar: product.owner.avatar?.url,
        },
      };
    });

    return res.json({
      status: 'success',
      data: { products: formattedProducts },
    });
  }
);

export const getLatestProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await Product.find({}).sort('-createdAt').limit(10);

    const formattedProducts = products.map((product) => formatProduct(product));

    return res.json({
      status: 'success',
      data: { products: formattedProducts },
    });
  }
);

export const getProductsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { category },
    } = req;

    const { page = '1', limit = '10' } = req.query as {
      page: string;
      limit: string;
    };

    const convertedPage = parseInt(page, 10) || 1;
    const convertedLimit = parseInt(limit, 10) || 10;
    const startIndex = (convertedPage - 1) * convertedLimit;

    if (!categories.includes(category))
      return sendErrorResponse(res, 'Invalid category', 422);

    const products = await Product.find({ category })
      .skip(startIndex)
      .limit(convertedLimit)
      .sort('-createdAt');
    const formattedProducts = products.map((product) => formatProduct(product));

    return res.json({
      status: 'success',
      data: { products: formattedProducts },
    });
  }
);

export const getSingleProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { id },
    } = req;

    const product = await Product.findById(id).populate<{
      owner: UserDocument;
    }>('owner', 'id name avatar');
    if (!product) return sendErrorResponse(res, 'Product not found', 404);

    const formattedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      thumbnail: product.thumbnail,
      category: product.category,
      price: product.price,
      date: product.purchasingDate,
      images: product?.images?.map(({ url }) => url),
      seller: {
        id: product.owner._id,
        name: product.owner.name,
        avatar: product.owner.avatar?.url,
      },
    };

    return res.json({ status: 'success', data: { product: formattedProduct } });
  }
);
