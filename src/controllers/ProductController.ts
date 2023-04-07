import { Request, Response } from 'express';
import Product from '../models/Product';

class ProductController {
  public async index(_req: Request, res: Response): Promise<Response> {
    try {
      const products = await Product.find({});
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
      const product = await Product.findById(id);

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
