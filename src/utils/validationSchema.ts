import { isValidObjectId } from 'mongoose';
import * as yup from 'yup';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

yup.addMethod(yup.string, 'email', function validateEmail(message) {
  return this.matches(emailRegex, {
    message,
    name: 'email',
    excludeEmptyString: true,
  });
});

export const SignupUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(3, 'Name is too short')
    .max(20, 'Name is too long'),
  email: yup.string().required('Email is required').email('Invalid email!'),
  password: yup
    .string()
    .trim()
    .required('Password is required')
    .min(8, 'Password is too short')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      'Password should contain alphabetical characters and special character and numbers.'
    ),
});

export const SigninUserSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email!'),
  password: yup
    .string()
    .trim()
    .required('Password is required')
    .min(8, 'Password is too short')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      'Password should contain alphabetical characters and special character and numbers.'
    ),
});

export const VerifyEmailSchema = yup.object().shape({
  id: yup.string().test({
    name: 'valid-id',
    message: 'Invalid user id',
    test: (value) => isValidObjectId(value),
  }),
  token: yup.string().trim().required('token is required'),
});
