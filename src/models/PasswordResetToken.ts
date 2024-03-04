import { Model, ObjectId, Schema, model } from 'mongoose';
import { compare, hash, genSalt } from 'bcrypt';

import { PasswordResetTokenDocument } from 'src/@types/password';

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const PasswordResetTokenSchema = new Schema<
  PasswordResetTokenDocument,
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
    expires: 3600, // 60 (min) * 60 (second) * 1 (hour) = 1 hours in second
    default: Date.now(),
  },
});

PasswordResetTokenSchema.pre('save', async function (next) {
  if (this.isModified('token')) {
    const salt = await genSalt(12);
    this.token = await hash(this.token, salt);
  }
  next();
});

PasswordResetTokenSchema.methods.compareToken = async function (token) {
  const result = await compare(token, this.token);
  return result;
};

const PasswordResetToken = model(
  'PasswordResetToken',
  PasswordResetTokenSchema
) as Model<PasswordResetTokenDocument, {}, Methods>;
export default PasswordResetToken;
