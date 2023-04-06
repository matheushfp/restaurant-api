import { Request, Response } from 'express';
import Category from '../models/Category';

class CategoryController {
  public async index(_req: Request, res: Response): Promise<Response> {
    try {
      const categories = await Category.find({});
      return res.json(categories);
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }
}

export default new CategoryController();
