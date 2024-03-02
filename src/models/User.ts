import { Model, ObjectId, Schema, model } from 'mongoose';
import { compare, hash, genSalt } from 'bcrypt';

import { UserDocument } from 'src/@types/user';

interface Methods {
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument, {}, Methods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Object,
      url: String,
      publicId: String,
    },
    tokens: [String],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await genSalt(12);
    this.password = await hash(this.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  const result = await compare(password, this.password);
  return result;
};

const User = model('User', UserSchema) as Model<UserDocument, {}, Methods>;
export default User;
