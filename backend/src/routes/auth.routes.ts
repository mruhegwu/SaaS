import { Router } from 'express';
import { githubOAuthRedirect, githubCallback, getMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const authRoutes = Router();

authRoutes.get('/github', githubOAuthRedirect);
authRoutes.get('/callback', githubCallback);
authRoutes.get('/me', authMiddleware, getMe);
