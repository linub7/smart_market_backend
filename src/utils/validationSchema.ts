import * as yup from 'yup';

import { EMAIL_REGEX, PASSWORD_REGEX } from 'constants/index';
import { isValidObjectId } from 'mongoose';

yup.addMethod(yup.string, 'email', function validateEmail(message) {
  return this.matches(EMAIL_REGEX, {
    message,
    name: 'email',
    excludeEmptyString: true,
  });
});

const tokenAndId = {
  id: yup.string().test({
    name: 'valid-id',
    message: 'Invalid user id',
    test: (value) => isValidObjectId(value),
  }),
  token: yup.string().trim().required('token is required'),
};

const password = {
  password: yup
    .string()
    .trim()
    .required('Password is required')
    .min(8, 'Password is too short')
    .matches(
      PASSWORD_REGEX,
      'Password should contain alphabetical characters and special character and numbers.'
    ),
};

export const SignupUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(3, 'Name is too short')
    .max(20, 'Name is too long'),
  email: yup.string().required('Email is required').email('Invalid email!'),
  ...password,
});

export const SigninUserSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email!'),
  ...password,
});

export const VerifyTokenSchema = yup.object().shape({
  ...tokenAndId,
});

export const ForgotPasswordSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email!'),
});

export const UpdatePasswordSchema = yup.object().shape({
  ...tokenAndId,
  ...password,
});

export const UpdateProfileSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(3, 'Name is too short')
    .max(20, 'Name is too long'),
});
