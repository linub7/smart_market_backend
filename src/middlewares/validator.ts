import { RequestHandler } from 'express';
import * as yup from 'yup';

import { sendErrorResponse } from 'utils/helpers';

export const validate = (schema: yup.Schema): RequestHandler => {
  return async (req, res, next) => {
    const { body } = req;

    if (!body)
      return res.status(422).json({
        status: 'fail',
        message: 'Empty body is not expected!',
      });

    const schemaToValidate = yup.object({
      body: schema,
    });

    try {
      await schemaToValidate.validate(
        {
          body,
        },
        {
          abortEarly: true,
        }
      );
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return sendErrorResponse(res, error?.message, 422);
      } else {
        next(error);
      }
    }
  };
};
