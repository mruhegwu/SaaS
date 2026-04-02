import { Response, NextFunction } from 'express';
import { AppDataSource } from '../database/connection';
import { Repository } from '../models/Repository';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { listUserRepos, GithubRepo } from '../services/github.service';
import { decryptToken } from '../services/encryption.service';

export async function getGithubRepos(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user?.accessToken) {
      res.status(401).json({ error: 'GitHub access token not found' });
      return;
    }

    const token = decryptToken(user.accessToken);
    const repos = await listUserRepos(token);
    res.json(repos);
  } catch (err) {
    next(err);
  }
}

export async function importRepository(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { githubId } = req.params;
    const githubRepo = req.body as GithubRepo;

    const repoRepo = AppDataSource.getRepository(Repository);
    const existing = await repoRepo.findOne({ where: { githubId, userId } });
    if (existing) {
      res.json(existing);
      return;
    }

    const repo = repoRepo.create({
      githubId: String(githubRepo.id || githubId),
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      description: githubRepo.description || '',
      language: githubRepo.language || '',
      private: githubRepo.private || false,
      userId,
    });

    await repoRepo.save(repo);
    res.status(201).json(repo);
  } catch (err) {
    next(err);
  }
}

export async function listRepositories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const repoRepo = AppDataSource.getRepository(Repository);
    const repos = await repoRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    res.json(repos);
  } catch (err) {
    next(err);
  }
}
