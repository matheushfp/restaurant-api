import { Schema, model } from 'mongoose';

interface IUser {
  email: String;
  password: String;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = model<IUser>('User', userSchema);

export default User;
