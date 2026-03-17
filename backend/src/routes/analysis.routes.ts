import { Router } from 'express';
import { startAnalysis, getAnalysis } from '../controllers/analysis.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const analysisRoutes = Router();

analysisRoutes.use(authMiddleware);
analysisRoutes.post('/:repoId/analyze', startAnalysis);
analysisRoutes.get('/:repoId', getAnalysis);
