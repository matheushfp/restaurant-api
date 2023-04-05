import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

function validateToken(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    res.status(401).json({
      status: 'error',
      message: 'Token not informed'
    });
  }

  // Bearer jId34sa2a09s8d83...
  const token = authToken!.split(' ')[1];

  // Verify token
  try {
    verify(token, process.env.SECRET as string);
    return next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid Token'
    });
  }
}

export { validateToken };
