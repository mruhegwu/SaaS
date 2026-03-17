import { Router } from 'express';
import { getGithubRepos, importRepository, listRepositories } from '../controllers/repo.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const repoRoutes = Router();

repoRoutes.use(authMiddleware);
repoRoutes.get('/github', getGithubRepos);
repoRoutes.post('/import/:githubId', importRepository);
repoRoutes.get('/', listRepositories);
