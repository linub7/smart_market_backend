import { Model, Schema, model } from 'mongoose';

import { ProductDocument } from 'src/@types/product';
import categories from 'utils/categories';

const ProductSchema = new Schema<ProductDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [...categories],
      required: true,
    },
    images: [{ type: Object, url: String, publicId: String }],
    thumbnail: String,
    purchasingDate: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Product = model('Product', ProductSchema) as Model<ProductDocument>;
export default Product;
