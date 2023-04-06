import { Router } from 'express';
import UserController from './controllers/UserController';
import { validateToken } from './middlewares/validateToken';
import CategoryController from './controllers/CategoryController';

const route = Router();

route.get('/ping', (_, res) => {
  res.json({ status: 'success', message: 'pong' });
});

route.post('/auth/login', UserController.authenticate);
route.post('/auth/register', validateToken, UserController.create);

route.get('/category', validateToken, CategoryController.index);

export { route };
