import { Router } from 'express';
import UserController from './controllers/UserController';

const route = Router();

route.get('/ping', (_, res) => {
  res.json({ status: 'success', message: 'pong' });
});

route.post('/auth/register', UserController.create);

export { route };
