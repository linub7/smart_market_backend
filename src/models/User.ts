import { Model, ObjectId, Schema, model } from 'mongoose';
import { compare, hash, genSalt } from 'bcrypt';

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  avatar?: { url: string; publicId: string };
}

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
