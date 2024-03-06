import { UploadApiResponse } from 'cloudinary';

import cloudinary from 'cloud/index';

export const uploadImage = async (
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
