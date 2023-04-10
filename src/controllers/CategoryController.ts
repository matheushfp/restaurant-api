import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import Category from '../models/Category';
import ICustomError from '../interfaces/ICustomError';

// ZodSchema to validate user inputs
const categorySchema = z.object({
  name: z.string(),
  parent: z
    .object({
      id: z.string(),
      name: z.string().optional()
    })
    .optional()
});

class CategoryController {
  public async index(_req: Request, res: Response): Promise<Response> {
    try {
      const categories = await Category.find({}).populate('parent');
      return res.json(categories);
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
      const category = await Category.findById(id).populate('parent');

      // Not Found
      if (category === null) {
        return res.status(404).json({
          status: 'error',
          message: 'Category Not Found'
        });
      }

      return res.json(category);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<Response> {
    const result = categorySchema.safeParse(req.body);

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

    const { name, parent } = result.data;

    // Check if the category already exists
    const query = await Category.findOne({ name });

    if (query) {
      return res.status(409).json({
        status: 'error',
        message: `Category ${name} already exists`
      });
    }

    // If parent is informed, check if exists
    if (parent) {
      // handle invalid IDs
      if (!isValidObjectId(parent.id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid ID in parent'
        });
      }

      const parentQuery = await Category.findById(parent.id);

      // Not Found in the database
      if (!parentQuery) {
        return res.status(404).json({
          status: 'error',
          message: 'Parent ID Not Found'
        });
      }
    }

    // Create new Category (after all validations)
    try {
      const category = await Category.create({
        name,
        parent: parent?.id
      });

      await category.populate('parent');

      return res.status(201).json(category);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }
}

export default new CategoryController();
