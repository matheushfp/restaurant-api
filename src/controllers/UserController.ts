import { Request, Response } from 'express';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import User from '../models/User';

// Create zod Schema to validate user inputs
const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

class UserController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { email, password } = userSchema.parse(req.body);

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

    await user.save();

    return res.status(201).json({
      status: 'success',
      data: user
    });
  }
}

export default new UserController();
