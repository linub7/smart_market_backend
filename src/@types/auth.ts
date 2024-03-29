import { ObjectId } from 'mongoose';

export interface AuthVerificationTokenDocument extends Document {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}
