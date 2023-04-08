import { Router } from 'express';
import { validateToken } from './middlewares/validateToken';
import UserController from './controllers/UserController';
import CategoryController from './controllers/CategoryController';
import ProductController from './controllers/ProductController';

const route = Router();

route.get('/ping', (_req, res) => {
  res.json({ status: 'success', message: 'pong' });
});

route.post('/auth/login', UserController.authenticate);
route.post('/auth/register', validateToken, UserController.create);

route.get('/category', validateToken, CategoryController.index);
route.post('/category', validateToken, CategoryController.create);

route.get('/product', validateToken, ProductController.index);
route.get('/product/:id', validateToken, ProductController.getByID);
route.delete('/product/:id', validateToken, ProductController.delete);

export { route };
