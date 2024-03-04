import { ObjectId } from 'mongoose';

export interface PasswordResetTokenDocument extends Document {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}
