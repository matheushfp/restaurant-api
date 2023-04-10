import { Request, Response } from 'express';
import { z } from 'zod';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import User from '../models/User';
import ICustomError from '../interfaces/ICustomError';

// Create zod Schema to validate user inputs
const userSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string()
});

class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const result = userSchema.safeParse(req.body);

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
    } else {
      const { email, password } = result.data;

      // Check if user exists
      const query = await User.findOne({ email }).exec();

      if (query) {
        return res.status(400).json({
          status: 'error',
          message: 'User Already Exists'
        });
      }

      // Create User
      const passwordHash = await hash(password, 10);

      const user = await User.create({
        email,
        password: passwordHash
      });

      return res.status(201).json({
        status: 'success',
        data: user
      });
    }
  }

  public async authenticate(req: Request, res: Response): Promise<Response> {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      // handle errors
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
    } else {
      const { email, password } = result.data;

      // Check if user exists
      const query = await User.findOne({ email }).exec();

      if (query === null) {
        // Not return explicitly "user not exists" to avoid attacks
        return res.status(401).json({
          status: 'error',
          message: 'The email address or password is incorrect.'
        });
      }

      // passwordHash stored in database
      const hash = query.password;

      // Check if password is correct
      const passwordMatch = await compare(password, hash);

      if (!passwordMatch) {
        // Wrong password
        return res.status(401).json({
          status: 'error',
          message: 'The email address or password is incorrect.'
        });
      }

      // Generate JWT
      const token = sign({}, process.env.SECRET as string, {
        subject: query.id,
        expiresIn: '1h'
      });

      return res.json({ status: 'success', token: token });
    }
  }
}

export default new UserController();
