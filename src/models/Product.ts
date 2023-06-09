import { Schema, model } from 'mongoose';
import { ICategory } from './Category';

interface IProduct {
  name: string;
  price: number;
  qty: number;
  categories: ICategory[];
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  qty: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    }
  ]
});

const Product = model<IProduct>('Product', productSchema);

export default Product;
