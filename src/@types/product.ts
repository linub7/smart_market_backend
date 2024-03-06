import { Document, Schema } from 'mongoose';

type productImage = { url: string; publicId: string };

export interface ProductDocument extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  price: number;
  purchasingDate: Date;
  category: string;
  images: productImage[];
  thumbnail?: string;
  description: string;
}
