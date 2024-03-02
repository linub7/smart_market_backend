import { ObjectId } from 'mongoose';

export interface AuthVerificationTokenDocument {
  owner: ObjectId;
  token: string;
  createdAt: Date;
}
