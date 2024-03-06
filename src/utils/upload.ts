import { UploadApiResponse } from 'cloudinary';

import cloudinary from 'cloud/index';

export const uploadImageToCloudinary = async (
  filePath: string,
  width: number,
  height: number,
  crop: string,
  isFace: boolean
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(filePath, {
    width,
    height,
    crop,
    gravity: isFace ? 'face' : '',
  });
};

export const destroyImageFromCloudinary = async (
  publicId: string
): Promise<UploadApiResponse> => {
  return cloudinary.uploader.destroy(publicId);
};
