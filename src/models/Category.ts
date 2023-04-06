import { Schema, model } from 'mongoose';

interface ICategory {
  name: string;
  parent?: ICategory;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
});

const Category = model<ICategory>('Category', categorySchema);

export { ICategory, categorySchema };

export default Category;
