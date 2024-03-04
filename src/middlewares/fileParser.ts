import { NextFunction, Request, Response } from 'express';
import formidable, { File } from 'formidable';

import { asyncHandler } from './async';
import { sendErrorResponse } from 'utils/helpers';

declare global {
  namespace Express {
    interface Request {
      files: { [key: string]: File | File[] };
    }
  }
}

const fileParser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['content-type']?.startsWith('multipart/form-data;'))
      return sendErrorResponse(res, 'Only accepts form-data!', 422);

    const form = formidable();
    const [fields, files] = await form.parse(req);

    if (!req.body) req.body = {};

    for (const key in fields) {
      req.body[key] = fields[key]![0];
    }

    if (!req.files) req.files = {};

    for (const key in files) {
      const actualFiles = files[key];
      if (!actualFiles) break;

      if (actualFiles.length > 1) {
        req.files[key] = actualFiles;
      } else {
        req.files[key] = actualFiles[0];
      }
    }
    next();
  }
);

export default fileParser;
