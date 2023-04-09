import { Router } from 'express';
import { validateToken } from './middlewares/validateToken';
import UserController from './controllers/UserController';
import CategoryController from './controllers/CategoryController';
import ProductController from './controllers/ProductController';

const route = Router();

route.get('/ping', (_req, res) => {
  res.json({ status: 'success', message: 'pong' });
});

// Auth
route.post('/auth/login', UserController.authenticate);
route.post('/auth/register', validateToken, UserController.create);

// Category
route.get('/category', validateToken, CategoryController.index);
route.post('/category', validateToken, CategoryController.create);

// Product
route.get('/product', validateToken, ProductController.index);
route.get('/product/:id', validateToken, ProductController.getByID);
route.post('/product', validateToken, ProductController.create);
route.patch('/product/:id', validateToken, ProductController.update);
route.delete('/product/:id', validateToken, ProductController.delete);

export { route };
