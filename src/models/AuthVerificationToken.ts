import { Model, ObjectId, Schema, model } from 'mongoose';
import { compare, hash, genSalt } from 'bcrypt';

import { AuthVerificationTokenDocument } from 'src/@types/auth';

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const AuthVerificationTokenSchema = new Schema<
  AuthVerificationTokenDocument,
  {},
  Methods
>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 86400, // 60 (min) * 60 (second) * 24 (hour) = 24 hours in second
    default: Date.now(),
  },
});

AuthVerificationTokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
    const salt = await genSalt(12);
    this.token = await hash(this.token, salt);
  }
  next();
});

AuthVerificationTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};

const AuthVerificationToken = model(
  'AuthVerificationToken',
  AuthVerificationTokenSchema
) as Model<AuthVerificationTokenDocument, {}, Methods>;
export default AuthVerificationToken;
