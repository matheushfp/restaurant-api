import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import Product from '../models/Product';
import Category from '../models/Category';
import ICustomError from '../interfaces/ICustomError';

// interface to create object used in PATCH route with all fields optional
// categories is a array of strings because only IDs will be passed to reference Category objects
interface IUpdateProduct {
  name?: string;
  price?: number;
  qty?: number;
  categories?: string[];
}

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

// Schema used to validade body in PATCH route
const updateProductSchema = z.object({
  name: z.string().optional(),
  qty: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  categories: z.array(categorySchema).min(1).optional()
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ID'
      });
    }

    try {
      const product = await Product.findById(id).populate('categories');

      // Not Found
      if (product === null) {
        return res.status(404).json({
          status: 'error',
          message: 'Product Not Found'
        });
      }

      return res.json(product);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
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
      return res.status(409).json({
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
    const notFound: string[] = []; // array to store ids not found in the database
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

  public async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const result = updateProductSchema.safeParse(req.body);

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

    // Empty Body or Body with no fields of interest
    if (Object.keys(result.data).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one field of the product should be sent via body'
      });
    }

    // Check if id is valid
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Product ID'
      });
    }

    // Check if product exists
    const query = await Product.findById(id);

    if (!query) {
      return res.status(404).json({
        status: 'error',
        message: 'Product Not Found'
      });
    }

    const { name, qty, price, categories } = result.data;

    // Object to store fields that will be inserted in the database
    const obj: IUpdateProduct = {};

    // Check if other product already uses this name
    if (name) {
      const nameQuery = await Product.findOne({ name });

      // Name already used
      if (nameQuery) {
        return res.status(409).json({
          status: 'error',
          message: `Another Product already uses this name: ${name}`
        });
      }

      obj.name = name;
    }

    // qty and price already validated by zod
    // only check if they were sent via body
    if (qty !== undefined) {
      obj.qty = qty;
    }

    if (price !== undefined) {
      obj.price = price;
    }

    // validations in categories
    if (categories) {
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
      const notFound: string[] = []; // array to store ids not found in the database
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

      obj.categories = validCategoriesIDs;
    }

    // Update requested fields
    try {
      const product = await Product.findByIdAndUpdate(id, obj, {
        returnDocument: 'after' // will return fields already updated in response
      });

      await product!.populate('categories');

      return res.status(200).json({
        product
      });
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
