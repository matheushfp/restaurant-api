import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import Product from '../models/Product';
import Category from '../models/Category';
import ICustomError from '../interfaces/ICustomError';

/* Zod schemas to validate user inputs
use slightly different categorySchema compared to the one 
used in CategoryController because id is required here */
const categorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  parent: z
    .object({
      id: z.string(),
      name: z.string().optional()
    })
    .optional()
});

const productSchema = z.object({
  name: z.string(),
  qty: z.number().int().min(0),
  price: z.number().min(0),
  categories: z.array(categorySchema).min(1)
});

function removeDuplicates(ids: string[]) {
  const set = new Set(ids);
  return Array.from(set);
}

class ProductController {
  public async index(_req: Request, res: Response): Promise<Response> {
    try {
      const products = await Product.find({}).populate('categories');
      return res.json(products);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }

  public async getByID(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const product = await Product.findById(id).populate('categories');

      /* if product is null, the user is trying to get a deleted product
      or a valid objectId not used yet to create a product */
      if (product === null) {
        return res.status(204).json();
      }

      return res.json(product);
    } catch (err) {
      return res.status(404).json({
        status: 'error',
        message: 'Product Not Found'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const result = productSchema.safeParse(req.body);

    // handling Bad Request error cases
    if (!result.success) {
      const customErrorMessage: ICustomError[] = [];

      // instead of showing entire ZodError object, only shows path and message
      result.error.errors.forEach((error) => {
        customErrorMessage.push({
          field: error.path,
          message: error.message
        });
      });

      return res.status(400).json({
        status: 'error',
        message: customErrorMessage
      });
    }

    const { name, qty, price, categories } = result.data;

    // Check if the product already exists
    const query = await Product.findOne({ name });

    if (query) {
      return res.status(400).json({
        status: 'error',
        message: `Product ${name} already exists`
      });
    }

    // Remove possible duplicate categories
    const categoriesIDs = removeDuplicates(
      categories.map((category) => category.id)
    );

    // Check if all ids are valid
    const validCategoriesIDs = categoriesIDs.filter((id) =>
      isValidObjectId(id)
    );

    if (validCategoriesIDs.length !== categoriesIDs.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more invalid Category ID'
      });
    }

    // Check if all categories exist in the database
    const notFound: string[] = []; // array to store ids not founded in the database
    for (let i = 0; i < validCategoriesIDs.length; i++) {
      const categoryQuery = await Category.findById(validCategoriesIDs[i]);

      // Not Found in the database
      if (!categoryQuery) {
        notFound.push(validCategoriesIDs[i]);
      }
    }

    if (notFound.length > 0) {
      return res.status(404).json({
        status: 'error',
        message: 'One or more Category ID Not Found'
      });
    }

    // Create new Product (after all validations)
    try {
      const product = await Product.create({
        name,
        qty,
        price,
        categories: validCategoriesIDs
      });

      await product.populate('categories');

      return res.status(201).json(product);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Check if product exists and try to delete
    try {
      const product = await Product.findByIdAndDelete(id);

      // handle if the user is trying to delete a product already deleted
      if (product === null) {
        return res.status(204).json();
      }

      return res.status(200).json({
        status: 'success',
        message: 'Product Deleted Successfully'
      });
    } catch (err) {
      return res.status(404).json({
        status: 'error',
        message: 'Product Not Found'
      });
    }
  }
}

export default new ProductController();
