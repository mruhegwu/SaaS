import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// ⚠️  WARNING: In-memory user store for scaffold purposes only.
// All users are lost on server restart. Replace with proper database
// persistence (e.g., TypeORM + PostgreSQL) before deploying to production.
const users: Map<
  string,
  { id: string; email: string; passwordHash: string; name: string; role: string }
> = new Map();

export class AuthService {
  async register(input: RegisterInput): Promise<AuthTokens> {
    if (users.has(input.email)) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = {
      id: randomUUID(),
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'user',
    };

    users.set(input.email, user);

    return this.generateTokens(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = users.get(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return this.generateTokens(user);
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        role: string;
      };

      const accessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      return { accessToken };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  private generateTokens(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }): AuthTokens {
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
