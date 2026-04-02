import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User';
import { exchangeCodeForToken, getGithubUser } from '../services/github.service';
import { encryptToken } from '../services/encryption.service';

export async function githubOAuthRedirect(_req: Request, res: Response): Promise<void> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: 'GitHub OAuth not configured' });
    return;
  }
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
  res.redirect(redirectUrl);
}

export async function githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.query as { code?: string };
    if (!code) {
      res.status(400).json({ error: 'Missing code parameter' });
      return;
    }

    const accessToken = await exchangeCodeForToken(code);
    const githubUser = await getGithubUser(accessToken);

    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { githubId: String(githubUser.id) } });

    const encryptedToken = encryptToken(accessToken);

    if (!user) {
      user = userRepo.create({
        githubId: String(githubUser.id),
        username: githubUser.login,
        email: githubUser.email || '',
        accessToken: encryptedToken,
        avatarUrl: githubUser.avatar_url,
      });
    } else {
      user.accessToken = encryptedToken;
      user.username = githubUser.login;
      user.avatarUrl = githubUser.avatar_url;
      if (githubUser.email) user.email = githubUser.email;
    }

    await userRepo.save(user);

    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      { userId: user.id, githubToken: accessToken },
      secret,
      { expiresIn: '7d' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as { userId?: string }).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'avatarUrl', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}
