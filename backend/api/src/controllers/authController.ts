import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({ success: false, message: 'email, name, and password are required' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ success: false, message: 'Invalid email format' });
    return;
  }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name, password: hashedPassword });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, { expiresIn: '7d' });

    res.status(201).json({ success: true, message: 'Registered successfully', data: { token } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'email and password are required' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ success: false, message: 'Invalid email format' });
    return;
  }

  try {
    const user = await User.findOne({ email });
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ success: true, message: 'Login successful', data: { token } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ success: false, message });
  }
};
